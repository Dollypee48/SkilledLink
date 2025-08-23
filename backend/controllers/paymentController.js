const Paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
const Payment = require('../models/Payment');

exports.initializePayment = async (req, res) => {
  try {
    const { email, amount } = req.body;
    const response = await Paystack.transaction.initialize({
      email, amount: amount * 100, currency: 'NGN', metadata: { userId: req.user.id }
    });
    const payment = new Payment({ userId: req.user.id, amount, reference: response.data.reference, status: 'pending' });
    await payment.save();
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    const response = await Paystack.transaction.verify({ reference });
    if (response.data.status === 'success') {
      await Payment.findOneAndUpdate({ reference }, { status: 'success' });
    }
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};