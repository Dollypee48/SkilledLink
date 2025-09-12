// frontend/src/pages/artisan/Subscription.jsx
import React, { useState, useEffect } from 'react';
import ArtisanLayout from '../../components/common/Layouts/ArtisanLayout';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import PaystackPayment from '../../components/PaystackPayment';
import PAYSTACK_CONFIG from '../../config/paystack';
import { 
  Crown, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  Shield, 
  Zap,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const Subscription = () => {
  const { user, accessToken, updateUser } = useAuth();
  const [plans, setPlans] = useState({});
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const PAYSTACK_PUBLIC_KEY = PAYSTACK_CONFIG.publicKey;

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-close payment modal after successful payment
  useEffect(() => {
    if (currentSubscription?.subscription?.status === 'active' && showPayment) {
      const timer = setTimeout(() => {
        setShowPayment(false);
        setPaymentData(null);
        setSelectedPlan(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentSubscription, showPayment]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansResponse, subscriptionResponse] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrentSubscription(accessToken)
      ]);
      
      console.log('Fetched subscription data:', subscriptionResponse);
      console.log('Subscription status:', subscriptionResponse.subscription?.status);
      console.log('Subscription plan:', subscriptionResponse.subscription?.plan);
      console.log('Subscription end date:', subscriptionResponse.subscription?.endDate);
      console.log('IsPremium:', subscriptionResponse.isPremium);
      console.log('PremiumFeatures:', subscriptionResponse.premiumFeatures);
      console.log('CanAcceptJobs:', subscriptionResponse.canAcceptJobs);
      console.log('RemainingJobs:', subscriptionResponse.remainingJobs);
      
      setPlans(plansResponse.plans);
      setCurrentSubscription(subscriptionResponse);
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if (plan === 'free') {
      setError('Cannot subscribe to free plan');
      return;
    }

    try {
      setLoading(true);
      const response = await subscriptionService.initializeSubscription(plan, accessToken);
      setPaymentData(response.payment);
      setSelectedPlan(plan);
      setShowPayment(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (reference) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      console.log('Processing payment success for reference:', reference);
      
      const response = await subscriptionService.verifyPayment(reference, accessToken);
      
      console.log('Payment verification response:', response);
      
      // Update user context with premium status immediately
      if (response.user) {
        updateUser(response.user);
      }
      
      // Update current subscription with the response data immediately
      setCurrentSubscription(response);
      
      // Close payment modal immediately
      setShowPayment(false);
      setPaymentData(null);
      setSelectedPlan(null);
      
      // Show success notification
      alert('🎉 Congratulations! You are now a Premium Artisan! You have access to all premium features including verified badge, priority search, and advanced analytics.');
      
      // Refresh subscription data in background to ensure consistency
      setTimeout(async () => {
        try {
          await fetchData();
        } catch (err) {
          console.error('Background refresh error:', err);
        } finally {
          setIsUpdating(false);
        }
      }, 1000);
      
    } catch (err) {
      console.error('Payment success error:', err);
      setError(err.message || 'Payment verification failed. Please contact support.');
      setIsUpdating(false);
    }
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    setPaymentData(null);
    setSelectedPlan(null);
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        setLoading(true);
        await subscriptionService.cancelSubscription(accessToken);
        await fetchData(); // Refresh data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'expired':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <ArtisanLayout>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#151E3D]" />
            <span className="ml-2 text-gray-600">Loading subscription data...</span>
          </div>
        </div>
      </ArtisanLayout>
    );
  }

  return (
    <ArtisanLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <div className="p-4">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-full mb-4 shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] bg-clip-text text-transparent mb-3">
              Subscription Management
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Choose the perfect plan for your business needs
            </p>
          </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Current Subscription Status - Enhanced */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-50 to-pink-50 rounded-full translate-y-8 -translate-x-8"></div>
          
          {/* Updating Indicator */}
          {isUpdating && (
            <div className="absolute inset-0 bg-blue-50 bg-opacity-75 flex items-center justify-center z-20 rounded-xl">
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Updating subscription...</span>
              </div>
            </div>
          )}
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  currentSubscription?.subscription?.plan === 'premium' && currentSubscription?.subscription?.status === 'active'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}>
                  {currentSubscription?.subscription?.plan === 'premium' && currentSubscription?.subscription?.status === 'active' ? (
                    <Crown className="w-5 h-5 text-white" />
                  ) : (
                    <Shield className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Current Plan</h2>
                  <p className="text-sm text-gray-500">Your active subscription details</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                currentSubscription?.subscription?.plan === 'premium' && currentSubscription?.subscription?.status === 'active'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
              }`}>
                {currentSubscription?.subscription?.plan === 'premium' && currentSubscription?.subscription?.status === 'active' ? 'PREMIUM' : 'FREEMIUM'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Plan Type</p>
                </div>
                <p className="text-lg font-bold text-gray-800 capitalize">
                  {currentSubscription?.subscription?.plan === 'premium' && currentSubscription?.subscription?.status === 'active' 
                    ? 'Premium' 
                    : 'Freemium'
                  }
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
                </div>
                <p className="text-lg font-bold text-gray-800 capitalize">
                  {currentSubscription?.subscription?.plan === 'premium' && currentSubscription?.subscription?.status === 'active' 
                    ? 'Active' 
                    : 'Active (Free)'
                  }
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">End Date</p>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {currentSubscription?.subscription?.plan === 'premium' && currentSubscription?.subscription?.status === 'active' && currentSubscription?.subscription?.endDate
                    ? new Date(currentSubscription.subscription.endDate).toLocaleDateString()
                    : 'Never (Freemium)'
                  }
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job Limit</p>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {currentSubscription?.remainingJobs === 'Unlimited' || currentSubscription?.isPremium
                    ? 'Unlimited'
                    : `${currentSubscription?.remainingJobs || 0} remaining`
                  }
                </p>
              </div>
            </div>


            {currentSubscription?.subscription?.plan === 'premium' && currentSubscription?.subscription?.status === 'active' && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">Manage Subscription</h3>
                    <p className="text-sm text-gray-500">Cancel or modify your premium subscription</p>
                  </div>
                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Plans - Enhanced */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">Choose Your Plan</h2>
          <p className="text-center text-gray-600 mb-8">Select the perfect plan for your business needs</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {Object.entries(plans).map(([planKey, plan]) => (
            <div
              key={planKey}
              className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:scale-102 hover:shadow-2xl ${
                planKey === 'premium'
                  ? 'border-[#F59E0B] shadow-[#F59E0B]/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge for Premium */}
              {planKey === 'premium' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-4 py-1 rounded-full text-xs font-bold shadow-md">
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-purple-50 to-pink-50 rounded-full translate-y-6 -translate-x-6"></div>

              <div className="relative z-10 p-6">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${
                    planKey === 'premium' 
                      ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] shadow-md' 
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}>
                    {planKey === 'premium' ? (
                      <Crown className="w-6 h-6 text-white" />
                    ) : (
                      <Shield className="w-6 h-6 text-white" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] bg-clip-text text-transparent mb-1">
                    ₦{plan.price === 0 ? '0' : (plan.price / 100).toLocaleString()}
                    {plan.price > 0 && <span className="text-sm text-gray-500">/month</span>}
                  </div>
                  <p className="text-sm text-gray-500">
                    {plan.duration === 'unlimited' ? 'No expiration' : `${plan.duration} days`}
                  </p>
                </div>

                {/* Features List */}
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-800 mb-3 text-center">What's Included</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  {(planKey === 'free' && (!currentSubscription?.subscription || currentSubscription?.subscription?.plan !== 'premium' || currentSubscription?.subscription?.status !== 'active')) || 
                   (planKey === 'premium' && currentSubscription?.subscription?.plan === 'premium' && currentSubscription?.subscription?.status === 'active') ? (
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold shadow-md">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(planKey)}
                      disabled={loading || (planKey === 'free' && (!currentSubscription?.subscription || currentSubscription?.subscription?.plan !== 'premium' || currentSubscription?.subscription?.status !== 'active'))}
                      className={`w-full py-3 px-4 rounded-lg font-bold text-base transition-all duration-300 transform hover:-translate-y-0.5 ${
                        planKey === 'premium'
                          ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white shadow-md hover:shadow-lg'
                          : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Processing...
                        </div>
                      ) : (
                        planKey === 'free' ? 'Current Plan' : 'Get Started'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Modal - Enhanced */}
        {showPayment && paymentData && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={handlePaymentClose}
          >
            <div 
              className="bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all duration-300 scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-t-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Complete Payment</h3>
                      <p className="text-blue-100 text-xs">Secure payment processing</p>
                    </div>
                  </div>
                  <button
                    onClick={handlePaymentClose}
                    className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    ₦{(paymentData.amount / 100).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Premium Subscription - 30 days</p>
                </div>
                
                <PaystackPayment
                  amount={paymentData.amount}
                  email={user.email}
                  publicKey={PAYSTACK_PUBLIC_KEY}
                  reference={paymentData.reference}
                  accessCode={paymentData.accessCode}
                  customerCode={paymentData.customerCode}
                  onSuccess={handlePaymentSuccess}
                  onClose={handlePaymentClose}
                />
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </ArtisanLayout>
  );
};

export default Subscription;
