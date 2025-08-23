const Paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

module.exports = {
  initialize: (email, amount) => Paystack.transaction.initialize({ email, amount: amount * 100, currency: 'NGN' }),
  verify: (reference) => Paystack.transaction.verify({ reference })
};