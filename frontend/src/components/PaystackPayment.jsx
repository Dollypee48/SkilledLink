import React, { useState, useEffect } from 'react';
import { PaystackButton } from 'react-paystack';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { detectBrowserIssues, getBrowserCompatibilityScore, getCompatibilityRecommendations } from '../utils/browserCompatibility';

const PaystackPayment = ({ 
  amount, 
  email, 
  onSuccess, 
  onClose, 
  publicKey,
  reference,
  accessCode,
  customerCode 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  const config = {
    reference: reference,
    email: email,
    amount: amount, // Amount is already in kobo from backend
    publicKey: publicKey,
    currency: 'NGN',
    metadata: {
      customerCode: customerCode
    }
  };


  const onSuccessCallback = async (reference) => {
    setIsProcessing(true);
    setPaymentStatus('success');
    
    try {
      // Call the success handler and wait for it to complete
      await onSuccess(reference);
      
      // Close the modal after success is processed
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Payment success handler failed:', error);
      setError('Payment verification failed. Please contact support.');
      setPaymentStatus('error');
      setIsProcessing(false);
    }
  };

  const onCloseCallback = () => {
    setPaymentStatus('cancelled');
    onClose();
  };

  const onErrorCallback = (error) => {
    let errorMessage = 'Payment failed: ';
    
    if (error.message) {
      errorMessage += error.message;
    } else if (error.includes && error.includes('fingerprinting')) {
      errorMessage += 'Browser security features are blocking the payment. Please try the solutions below.';
    } else {
      errorMessage += 'Unknown error occurred. Please try again or contact support.';
    }
    
    setError(errorMessage);
    setIsProcessing(false);
    setPaymentStatus('error');
  };

  const handlePaymentClick = () => {
    // Validate required parameters
    if (!publicKey || publicKey.includes('your_public_key_here') || publicKey.includes('your_actual_public_key_here')) {
      setError('Paystack configuration error. Please contact support.');
      return;
    }

    if (!reference || !email || !amount) {
      setError('Missing payment information. Please try again.');
      return;
    }

    if (amount <= 0) {
      setError('Invalid payment amount. Please try again.');
      return;
    }

    // Validate config object
    if (!config || !config.publicKey || !config.reference) {
      setError('Payment configuration error. Please try again.');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
  };

  useEffect(() => {
    if (paymentStatus === 'success') {
      const timer = setTimeout(() => {
        setIsProcessing(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  // Validate config on mount and check browser compatibility
  useEffect(() => {
    if (!config || !config.publicKey || !config.reference || !config.email || !config.amount) {
      setError('Invalid payment configuration. Please refresh the page and try again.');
      return;
    }

    // Check for browser compatibility issues
    const checkBrowserCompatibility = () => {
      const issues = detectBrowserIssues();
      const score = getBrowserCompatibilityScore();
      const recommendations = getCompatibilityRecommendations();
      
      if (issues.length > 0) {
        console.warn('Browser compatibility issues detected:', issues);
        console.warn('Compatibility score:', score);
        console.warn('Recommendations:', recommendations);
      }
      
      // If compatibility score is low, show warning
      if (score < 70) {
        setError('Browser compatibility issues detected. Please check the recommendations below.');
      }
    };

    checkBrowserCompatibility();
  }, [config]);

  if (paymentStatus === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">Your subscription has been activated.</p>
        <p className="text-sm text-gray-500 mb-4">This window will close automatically...</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  if (paymentStatus === 'cancelled') {
    return (
      <div className="text-center py-8">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-800 mb-2">Payment Cancelled</h3>
        <p className="text-gray-600">You can try again anytime.</p>
        <button
          onClick={() => setPaymentStatus(null)}
          className="mt-4 px-6 py-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (error) {
    const isBrowserBlockingError = error.includes('fingerprinting') || error.includes('blocking');
    
    return (
      <div className="text-center py-8">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-800 mb-2">Payment Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        
        {isBrowserBlockingError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
            <h4 className="font-semibold text-yellow-800 mb-2">Quick Fix:</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Copy this URL: <code className="bg-yellow-100 px-1 rounded">{window.location.href}</code></li>
              <li>2. Open an incognito/private window</li>
              <li>3. Paste the URL and try again</li>
            </ol>
          </div>
        )}
        
        <div className="space-x-3">
        <button
          onClick={() => setError(null)}
          className="px-6 py-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] transition-colors"
        >
          Try Again
        </button>
          
          {isBrowserBlockingError && (
            <button
              onClick={() => {
                const newWindow = window.open(window.location.href, '_blank');
                if (newWindow) {
                  newWindow.focus();
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open in New Window
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Complete Your Payment</h3>
        <p className="text-gray-600">Amount: ₦{(amount / 100).toLocaleString()}</p>
      </div>

      {/* Pre-payment Browser Check */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-left">
        <div className="flex items-start space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-green-800">
            <p className="font-medium">Payment Ready</p>
            <p className="text-xs text-green-600 mt-1">
              Your browser is compatible with our secure payment system. Click below to proceed.
            </p>
          </div>
        </div>
      </div>

      <PaystackButton
        {...config}
        text={isProcessing ? "Processing..." : "Pay with Paystack"}
        onSuccess={onSuccessCallback}
        onClose={onCloseCallback}
        onError={onErrorCallback}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
          isProcessing
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-[#151E3D] hover:bg-[#1E2A4A] text-white hover:shadow-lg transform hover:-translate-y-0.5'
        }`}
        disabled={isProcessing}
      />

      <p className="text-xs text-gray-500 mt-4">
        Secure payment powered by Paystack
      </p>
      
      {/* Dynamic Browser Protection Notice */}
      {(() => {
        const recommendations = getCompatibilityRecommendations();
        const hasIssues = recommendations.some(rec => rec.type !== 'success');
        
        if (!hasIssues) return null;
        
        return (
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Payment Security Notice</p>
                <p className="mb-2">We detected some browser settings that may interfere with payment processing:</p>
                <div className="space-y-2">
                  {recommendations.filter(rec => rec.type !== 'success').map((rec, index) => (
                    <div key={index} className="p-2 bg-blue-100 rounded">
                      <p className="font-medium text-blue-900">{rec.message}</p>
                      {rec.steps && (
                        <ol className="text-xs text-blue-700 mt-1 space-y-1">
                          {rec.steps.map((step, stepIndex) => (
                            <li key={stepIndex}>{stepIndex + 1}. {step}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default PaystackPayment;
