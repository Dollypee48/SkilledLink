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
      
      setPlans(plansResponse.plans);
      setCurrentSubscription(subscriptionResponse);
    } catch (err) {
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
      setLoading(true);
      
      const response = await subscriptionService.verifyPayment(reference, accessToken);
      
      // Update current subscription with the response data
      setCurrentSubscription(response);
      
      // Update user context with premium status
      if (response.user) {
        updateUser(response.user);
      }
      
      // Show success message
      setError(null);
      
      // Close payment modal
      setShowPayment(false);
      setPaymentData(null);
      setSelectedPlan(null);
      
      // Refresh subscription data to get the latest status
      await fetchData();
      
      // Show success notification
      alert('🎉 Congratulations! You are now a Premium Artisan! You have access to all premium features including verified badge, priority search, and advanced analytics.');
      
      // Ensure modal is closed
      setShowPayment(false);
      setPaymentData(null);
      setSelectedPlan(null);
      
      // Force page refresh to ensure UI updates
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#151E3D] mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage your subscription plan and billing</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message for Active Premium Subscription */}
        {currentSubscription?.subscription?.status === 'active' && currentSubscription?.subscription?.plan === 'premium' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700 font-semibold">🎉 Premium Subscription Active!</span>
            </div>
            <p className="text-green-600 text-sm mt-1">You now have access to all premium features including verified badge, priority search, and advanced analytics.</p>
          </div>
        )}

        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Current Subscription</h2>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(currentSubscription.subscription?.status)}`}>
                {getStatusIcon(currentSubscription.subscription?.status)}
                <span className="ml-2 capitalize">{currentSubscription.subscription?.status}</span>
                {currentSubscription.subscription?.status === 'active' && currentSubscription.subscription?.plan === 'premium' && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    PREMIUM
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">
                  {currentSubscription.subscription?.plan || 'Free'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="text-lg font-semibold text-gray-800">
                  {currentSubscription.subscription?.startDate 
                    ? new Date(currentSubscription.subscription.startDate).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="text-lg font-semibold text-gray-800">
                  {currentSubscription.subscription?.endDate 
                    ? new Date(currentSubscription.subscription.endDate).toLocaleDateString()
                    : 'Never (Free Plan)'
                  }
                </p>
              </div>
            </div>

            {currentSubscription.subscription?.plan === 'premium' && currentSubscription.subscription?.status === 'active' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(plans).map(([planKey, plan]) => (
            <div
              key={planKey}
              className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all duration-300 ${
                planKey === 'premium'
                  ? 'border-[#F59E0B] hover:shadow-xl'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  planKey === 'premium' 
                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]' 
                    : 'bg-gray-100'
                }`}>
                  {planKey === 'premium' ? (
                    <Crown className="w-8 h-8 text-white" />
                  ) : (
                    <Shield className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-[#151E3D] mb-2">
                  ₦{plan.price === 0 ? '0' : (plan.price / 100).toLocaleString()}
                  {plan.price > 0 && <span className="text-lg text-gray-500">/month</span>}
                </div>
                <p className="text-gray-600">
                  {plan.duration === 'unlimited' ? 'No expiration' : `${plan.duration} days`}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Features:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center">
                {currentSubscription?.subscription?.plan === planKey && 
                 currentSubscription?.subscription?.status === 'active' ? (
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(planKey)}
                    disabled={loading || (planKey === 'free' && currentSubscription?.subscription?.plan === 'free')}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      planKey === 'premium'
                        ? 'bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] hover:from-[#1E2A4A] hover:to-[#0F172A] text-white hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      planKey === 'free' ? 'Current Plan' : 'Subscribe Now'
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Payment Modal */}
        {showPayment && paymentData && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handlePaymentClose}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
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
        )}
      </div>
    </ArtisanLayout>
  );
};

export default Subscription;
