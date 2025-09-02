const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conversationId: {
    type: String, // Unique identifier for a conversation between two users
    required: true,
  },
  content: {
    type: String,
    required: function() { return !this.fileUrl; }, // Content is required unless a file is provided
  },
  fileUrl: {
    type: String, // URL of the uploaded file (e.g., image, document)
    required: function() { return !this.content; }, // File is required if no content is provided
  },
  fileType: {
    type: String, // MIME type of the file (e.g., 'image/jpeg', 'application/pdf')
    required: function() { return !!this.fileUrl; }, // File type is required if fileUrl is present
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Message', MessageSchema);