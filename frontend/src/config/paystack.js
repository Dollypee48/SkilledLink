// Paystack configuration
const PAYSTACK_CONFIG = {
  publicKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PAYSTACK_PUBLIC_KEY) || 'pk_test_your_public_key',
  // You can add more Paystack configuration here
};

export default PAYSTACK_CONFIG;
