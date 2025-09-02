const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for system notifications
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['success', 'error', 'warning', 'info'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['job_status', 'message', 'system', 'payment', 'kyc'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  important: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Store additional data like jobId, messageId, etc.
    default: {}
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiration: 30 days from creation
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

module.exports = mongoose.model('Notification', NotificationSchema);
