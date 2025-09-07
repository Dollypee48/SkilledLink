import React, { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

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


  const initializePayment = usePaystackPayment(config);

  const onSuccessCallback = (reference) => {
    setIsProcessing(true);
    setPaymentStatus('success');
    
    // Call the success handler
    onSuccess(reference);
    
    // Close the modal after a short delay to show success message
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const onCloseCallback = () => {
    setPaymentStatus('cancelled');
    onClose();
  };

  const onErrorCallback = (error) => {
    setError(`Payment failed: ${error.message || 'Unknown error'}`);
    setIsProcessing(false);
    setPaymentStatus('error');
  };

  const handlePayment = () => {
    // Validate required parameters
    if (!publicKey || publicKey === 'pk_test_your_public_key_here' || publicKey === 'pk_test_your_actual_public_key_here') {
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
    setIsProcessing(true);
    setPaymentStatus('processing');
    initializePayment(onSuccessCallback, onCloseCallback, onErrorCallback);
  };

  useEffect(() => {
    if (paymentStatus === 'success') {
      const timer = setTimeout(() => {
        setIsProcessing(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

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
        <h3 className="text-xl font-semibold text-red-800 mb-2">Payment Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => setError(null)}
          className="px-6 py-2 bg-[#151E3D] text-white rounded-lg hover:bg-[#1E2A4A] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Complete Your Payment</h3>
        <p className="text-gray-600">Amount: ₦{(amount / 100).toLocaleString()}</p>
      </div>

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
          isProcessing
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-[#151E3D] hover:bg-[#1E2A4A] text-white hover:shadow-lg transform hover:-translate-y-0.5'
        }`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processing...
          </div>
        ) : (
          'Pay with Paystack'
        )}
      </button>

      <p className="text-xs text-gray-500 mt-4">
        Secure payment powered by Paystack
      </p>
    </div>
  );
};

export default PaystackPayment;
