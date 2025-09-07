const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  reference: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  currency: { type: String, default: 'NGN' },
  paymentMethod: { type: String, default: 'paystack' },
  metadata: { type: Object, default: {} },
  paidAt: { type: Date },
  failureReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
