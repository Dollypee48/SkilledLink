const Message = require('../models/Message');
const twilio = require('../services/twilio');

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const message = new Message({ senderId: req.user.id, recipientId, content });
    await message.save();
    const recipient = await User.findById(recipientId);
    if (recipient.phone) await twilio.sendSMS(recipient.phone, `New message from ${req.user.id}: ${content}`);
    res.status(201).json({ message: 'Message sent', message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ $or: [{ senderId: req.user.id }, { recipientId: req.user.id }] })
      .populate('senderId', 'name')
      .populate('recipientId', 'name');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!message || message.recipientId.toString() !== req.user.id) return res.status(404).json({ message: 'Message not found or unauthorized' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};