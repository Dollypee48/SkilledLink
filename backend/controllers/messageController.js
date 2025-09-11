const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');
const { uploadFile } = require('../utils/cloudinary');
const { getIo } = require('../utils/socket');
const NotificationService = require('../services/notificationService');

// Helper function to create consistent conversation ID
const getConversationId = (userId1, userId2) => {
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  return sortedIds.join('_');
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, fileData, fileType } = req.body;
    const senderId = req.user.id;
    
    // Validate input
    if (!content && !fileData) {
      return res.status(400).json({ message: 'Message content or file is required' });
    }
    
    if (content && fileData) {
      return res.status(400).json({ message: 'Cannot send both text content and a file in the same message' });
    }

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: 'Invalid recipient ID format' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    // Handle file upload if present
    let uploadedFileUrl = null;
    if (fileData && fileData !== null) {
      if (!fileType) {
        return res.status(400).json({ message: 'File type is required when sending a file' });
      }
      
      try {
        const uploadResult = await uploadFile(fileData, fileType, `messages/${senderId}`);
        uploadedFileUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(500).json({ message: 'Failed to upload file', error: uploadErr.message });
      }
    }

    // Create conversation ID
    const conversationId = getConversationId(senderId, recipientId);

    // Create and save the message
    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      conversationId,
      content: content || null,
      fileUrl: uploadedFileUrl,
      fileType: fileType,
    });

    // Populate sender and recipient details
    const populatedMessage = await message.populate([
      { path: 'sender', select: 'name profileImageUrl' },
      { path: 'recipient', select: 'name profileImageUrl' }
    ]);

    // Emit real-time message via Socket.IO
    const io = getIo();
    if (io) {
      // Emit to conversation room for real-time updates
      io.to(conversationId).emit('newMessage', populatedMessage);
    }
    
    // Send notification ONLY to recipient (not sender)
    try {
      await NotificationService.notifyNewMessage(populatedMessage, recipientId);
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }
    
    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error('sendMessage error:', err.message);
    res.status(500).json({ message: 'Server error sending message', error: err.message });
  }
};

// @desc    Get all messages in a specific conversation
// @route   GET /api/messages/:otherUserId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { otherUserId } = req.params;

    if (!otherUserId) {
      return res.status(400).json({ message: 'Other user ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: 'Invalid other user ID format' });
    }

    const conversationId = getConversationId(currentUserId, otherUserId);

    // Fetch messages sorted by timestamp
    const messages = await Message.find({ conversationId })
      .sort('timestamp')
      .populate([
        { path: 'sender', select: 'name profileImageUrl' },
        { path: 'recipient', select: 'name profileImageUrl' }
      ]);

    // Mark messages as read for the current user
    await Message.updateMany(
      { conversationId, recipient: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    console.error('getConversation error:', err.message);
    res.status(500).json({ message: 'Server error fetching conversation', error: err.message });
  }
};

// @desc    Get all conversations for the logged-in user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all messages where the current user is either sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: currentUserId },
        { recipient: currentUserId }
      ]
    })
    .sort('-timestamp')
    .populate([
      { path: 'sender', select: 'name profileImageUrl' },
      { path: 'recipient', select: 'name profileImageUrl' }
    ]);

    // Group messages by conversationId and get the latest message for each
    const conversationMap = new Map();
    
    messages.forEach(message => {
      const conversationId = message.conversationId;
      if (!conversationMap.has(conversationId) || 
          new Date(message.timestamp) > new Date(conversationMap.get(conversationId).timestamp)) {
        conversationMap.set(conversationId, message);
      }
    });

    // Convert map to array and sort by timestamp
    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(conversations);
  } catch (err) {
    console.error('getConversations error:', err.message);
    res.status(500).json({ message: 'Server error fetching conversations', error: err.message });
  }
};

// @desc    Delete a specific message
// @route   DELETE /api/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID format' });
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== currentUserId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    // Emit deletion event via Socket.IO
    const io = getIo();
    if (io) {
      io.to(message.sender.toString()).emit('messageDeleted', {
        messageId: messageId,
        conversationId: message.conversationId
      });
      io.to(message.recipient.toString()).emit('messageDeleted', {
        messageId: messageId,
        conversationId: message.conversationId
      });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('deleteMessage error:', err.message);
    res.status(500).json({ message: 'Server error deleting message', error: err.message });
  }
};

// @desc    Clear all messages in a conversation
// @route   DELETE /api/messages/conversation/:otherUserId
// @access  Private
exports.clearConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { otherUserId } = req.params;

    if (!otherUserId) {
      return res.status(400).json({ message: 'Other user ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: 'Invalid other user ID format' });
    }

    const conversationId = getConversationId(currentUserId, otherUserId);

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId });

    // Emit clear event via Socket.IO
    const io = getIo();
    if (io) {
      io.to(currentUserId).emit('conversationCleared', {
        conversationId: conversationId,
        otherUserId: otherUserId
      });
      io.to(otherUserId).emit('conversationCleared', {
        conversationId: conversationId,
        otherUserId: currentUserId
      });
    }

    res.json({ message: 'Conversation cleared successfully' });
  } catch (err) {
    console.error('clearConversation error:', err.message);
    res.status(500).json({ message: 'Server error clearing conversation', error: err.message });
  }
};