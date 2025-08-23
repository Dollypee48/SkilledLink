const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

module.exports = {
  initialize: (email, amount, txRef) => flw.Charge.card({
    card_number: '4123450131001381',
    cvv: '100',
    expiry_month: '10',
    expiry_year: '23',
    currency: 'NGN',
    amount,
    email,
    tx_ref: txRef
  }),
  verify: (transactionId) => flw.Transaction.verify({ id: transactionId })
};