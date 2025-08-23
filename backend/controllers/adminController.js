const User = require('../models/User');
const Booking = require('../models/Booking');

exports.verifyKYC = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { kycVerified: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'KYC verified', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User suspended', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const bookingsCount = await Booking.countDocuments();
    res.json({ usersCount, bookingsCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};