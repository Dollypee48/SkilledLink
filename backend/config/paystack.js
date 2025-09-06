const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

// Debug Paystack configuration
console.log('🔍 Paystack Secret Key:', process.env.PAYSTACK_SECRET_KEY ? 'Set' : 'Not Set');
console.log('🔍 Paystack Public Key:', process.env.PAYSTACK_PUBLIC_KEY ? 'Set' : 'Not Set');

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free Plan',
    price: 0,
    duration: 'unlimited', // Free plan doesn't expire
    features: [
      'Basic profile listing',
      'Standard search visibility',
      'Basic customer support'
    ]
  },
  premium: {
    name: 'Premium Plan',
    price: 5000, // ₦50.00 in kobo
    duration: 30, // 30 days
    features: [
      'Verified badge on profile',
      'Priority in search results',
      'Advanced analytics',
      'Premium customer support',
      'Unlimited bookings'
    ]
  }
};

// Paystack webhook events
const PAYSTACK_EVENTS = {
  SUBSCRIPTION_CREATE: 'subscription.create',
  SUBSCRIPTION_ENABLE: 'subscription.enable',
  SUBSCRIPTION_DISABLE: 'subscription.disable',
  CHARGE_SUCCESS: 'charge.success',
  INVOICE_CREATE: 'invoice.create',
  INVOICE_UPDATE: 'invoice.update'
};

module.exports = {
  paystack,
  SUBSCRIPTION_PLANS,
  PAYSTACK_EVENTS
};
