import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, CreditCard, Building2, Smartphone } from 'lucide-react';

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
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // Load Paystack script with fallback
  useEffect(() => {
    const loadPaystackScript = () => {
      return new Promise((resolve, reject) => {
        // Check if Paystack is already loaded
        if (window.PaystackPop) {
          setPaystackLoaded(true);
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        
        // Set timeout for script loading
        const timeout = setTimeout(() => {
          reject(new Error('Script loading timeout'));
        }, 10000); // 10 second timeout
        
        script.onload = () => {
          clearTimeout(timeout);
          setPaystackLoaded(true);
          resolve();
        };
        
        script.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Failed to load Paystack script'));
        };
        
        document.head.appendChild(script);
      });
    };

    loadPaystackScript().catch(err => {
      console.error('Error loading Paystack:', err);
      setError('Network connection issue. Please try the alternative payment methods below or check your internet connection.');
    });
  }, []);

  const config = {
    key: publicKey,
    email: email,
    amount: amount,
    ref: reference,
    currency: 'NGN',
    metadata: {
      customerCode: customerCode
    },
    callback: (response) => {
      console.log('Paystack callback:', response);
      onSuccessCallback(response.reference);
    },
    onClose: () => {
      console.log('Paystack popup closed');
      onCloseCallback();
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

    if (!paystackLoaded) {
      setError('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // Use PaystackPop directly
      const handler = window.PaystackPop.setup(config);
      handler.openIframe();
    } catch (error) {
      console.error('Error opening Paystack popup:', error);
      onErrorCallback(error);
    }
  };

  useEffect(() => {
    if (paymentStatus === 'success') {
      const timer = setTimeout(() => {
        setIsProcessing(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  // Validate config on mount
  useEffect(() => {
    if (!config || !config.key || !config.ref || !config.email || !config.amount) {
      setError('Invalid payment configuration. Please refresh the page and try again.');
      return;
    }
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
    return (
      <div className="text-center py-8">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-800 mb-2">Payment System Issue</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        
        {/* Alternative Payment Methods */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
          <h4 className="font-semibold text-yellow-800 mb-3">Alternative Payment Options</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-yellow-200 rounded-lg">
              <h5 className="font-medium text-gray-800 mb-2">Option 1: Direct Bank Transfer</h5>
              <p className="text-sm text-gray-600 mb-2">Transfer directly to our account:</p>
              <div className="text-sm font-mono bg-gray-100 p-2 rounded">
                <div>Bank: Access Bank</div>
                <div>Account: 1234567890</div>
                <div>Name: SkilledLink Limited</div>
                <div>Amount: ₦{(amount / 100).toLocaleString()}</div>
                <div>Reference: {reference}</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Send proof of payment to: payments@skilledlink.com
              </p>
            </div>
            
            <div className="p-3 bg-white border border-yellow-200 rounded-lg">
              <h5 className="font-medium text-gray-800 mb-2">Option 2: Mobile Money</h5>
              <p className="text-sm text-gray-600 mb-2">Send via mobile money:</p>
              <div className="text-sm font-mono bg-gray-100 p-2 rounded">
                <div>Provider: MTN Mobile Money</div>
                <div>Number: 08012345678</div>
                <div>Amount: ₦{(amount / 100).toLocaleString()}</div>
                <div>Reference: {reference}</div>
              </div>
            </div>
            
            <div className="p-3 bg-white border border-yellow-200 rounded-lg">
              <h5 className="font-medium text-gray-800 mb-2">Option 3: Contact Support</h5>
              <p className="text-sm text-gray-600 mb-2">Get help with payment:</p>
              <div className="text-sm">
                <div>Email: support@skilledlink.com</div>
                <div>Phone: +234 801 234 5678</div>
                <div>WhatsApp: +234 801 234 5678</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-x-3">
          <button
            onClick={() => setError(null)}
            className="px-6 py-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] transition-colors"
          >
            Try Again
          </button>
          
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

      {/* Payment Methods Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-3">Available Payment Methods</h4>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700">Card</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700">Bank Transfer</span>
          </div>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700">USSD</span>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Choose your preferred payment method in the Paystack popup
        </p>
      </div>

      {/* Payment Status */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-left">
        <div className="flex items-start space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-green-800">
            <p className="font-medium">
              {paystackLoaded ? 'Payment System Ready' : 'Loading Payment System...'}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {paystackLoaded 
                ? 'Click below to open Paystack payment options'
                : 'Please wait while we load the secure payment system'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePaymentClick}
        disabled={isProcessing || !paystackLoaded}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 mb-3 ${
          isProcessing || !paystackLoaded
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-[#151E3D] hover:bg-[#1E2A4A] text-white hover:shadow-lg transform hover:-translate-y-0.5'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Processing...
          </div>
        ) : !paystackLoaded ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          'Pay with Paystack'
        )}
      </button>

      {/* Manual Payment Option */}
      <button
        onClick={() => setError('Network connection issue. Please try the alternative payment methods below or check your internet connection.')}
        className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
      >
        Having Issues? Try Alternative Payment
      </button>

      <p className="text-xs text-gray-500 mt-4">
        Secure payment powered by Paystack
      </p>
    </div>
  );
};

export default PaystackPayment;
