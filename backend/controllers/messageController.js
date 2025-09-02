const Message = require('../models/Message');
const User = require('../models/User');
const { getIo } = require('../config/socket'); // Import the getIo function
const mongoose = require('mongoose'); // Import mongoose to use ObjectId
const { uploadFile } = require('../utils/cloudinary'); // Import Cloudinary upload helper
const NotificationService = require('../services/notificationService'); // Import notification service

// Helper to create a consistent conversationId from two user IDs
const getConversationId = (userId1, userId2) => {
  // Sort IDs to ensure a consistent conversationId regardless of sender/recipient order
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  return sortedIds.join('_');
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, fileData, fileType } = req.body; // Added fileData and fileType
    const senderId = req.user.id; // Authenticated user ID
    
    // Validate that either content or fileData (but not both empty) is provided
    if (!content && !fileData) {
      return res.status(400).json({ message: 'Message content or file is required' });
    }
    if (content && fileData) {
        return res.status(400).json({ message: 'Cannot send both text content and a file in the same message' });
    }

    // Basic validation for recipient
    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    // Validate recipientId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        return res.status(400).json({ message: 'Invalid recipient ID format' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    let uploadedFileUrl = null;
    // Temporarily disabled file upload processing
    if (fileData && fileData !== null) {
        if (!fileType) {
            return res.status(400).json({ message: 'File type is required when sending a file' });
        }
        // Upload file to Cloudinary
        try {
            const uploadResult = await uploadFile(fileData, fileType, `messages/${senderId}`);
            uploadedFileUrl = uploadResult.secure_url;
        } catch (uploadErr) {
            console.error('Cloudinary upload error:', uploadErr); // Log the full error object
            return res.status(500).json({ message: 'Failed to upload file', error: uploadErr.message });
        }
    }

    // Create a consistent conversation ID
    const conversationId = getConversationId(senderId, recipientId);

    // Create and save the new message
    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      conversationId,
      content: content || null, // Store content as null if file is sent
      fileUrl: uploadedFileUrl,
      fileType: fileType,
    });

    // Populate sender and recipient details for real-time updates on frontend
    const populatedMessage = await message.populate([
      { path: 'sender', select: 'name profileImageUrl' },
      { path: 'recipient', select: 'name profileImageUrl' }
    ]);

    // Emit real-time message to both sender and recipient via Socket.IO
    const io = getIo(); 
    if (io) {
        io.to(senderId).emit('newMessage', populatedMessage);
        io.to(recipientId).emit('newMessage', populatedMessage);
    } 
    
    // Send notification to recipient
    try {
        await NotificationService.notifyNewMessage(populatedMessage, recipientId);
    } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't fail the message send if notification fails
    }
    
    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error('sendMessage error: Caught an exception:', err.message, err.stack);
    res.status(500).json({ message: 'Server error sending message', error: err.message });
  }
};

// @desc    Get all messages in a specific conversation
// @route   GET /api/messages/conversation/:otherUserId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { otherUserId } = req.params;

    console.log('getConversation - currentUserId:', currentUserId);
    console.log('getConversation - otherUserId from params:', otherUserId);

    if (!otherUserId) {
      return res.status(400).json({ message: 'Other user ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
        return res.status(400).json({ message: 'Invalid other user ID format' });
    }

    const conversationId = getConversationId(currentUserId, otherUserId);
    console.log('getConversation - Generated conversationId:', conversationId);

    // Fetch messages sorted by timestamp
    const messages = await Message.find({ conversationId })
      .sort('timestamp')
      .populate([ // Populate both sender and recipient
        { path: 'sender', select: 'name profileImageUrl' },
        { path: 'recipient', select: 'name profileImageUrl' }
      ]);
    console.log('getConversation - Fetched messages count:', messages.length);

    // Mark messages as read for the current user where they are the recipient
    const updateResult = await Message.updateMany(
      { conversationId, recipient: currentUserId, read: false },
      { $set: { read: true } }
    );
    console.log('getConversation - Messages marked as read:', updateResult.modifiedCount);

    res.json(messages);
  } catch (err) {
    console.error('getConversation error: Caught an exception:', err.message, err.stack);
    res.status(500).json({ message: 'Server error fetching conversation', error: err.message });
  }
};

// @desc    Get all conversations for the logged-in user (list of last messages)
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user ID

    const conversations = await Message.aggregate([
      { '$match': {
          '$or': [
            { 'sender': new mongoose.Types.ObjectId(userId) },
            { 'recipient': new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      { '$sort': { 'timestamp': -1 } },
      { '$group': {
          '_id': '$conversationId', // Group by conversation ID
          'lastMessage': { '$first': '$$\ROOT' }, // Get the entire last message document
          'unreadCount': { '$sum': {
            '$cond': [
              { '$and': [ // Condition to check if message is unread and for current user
                { '$eq': ['$recipient', new mongoose.Types.ObjectId(userId)] },
                { '$eq': ['$read', false] }
              ]},
              1, // If true, add 1 to count
              0  // If false, add 0
            ]
          }}
        }
      },
      { '$replaceRoot': { 'newRoot': '$lastMessage' } }, // Replace root with the last message document
      { '$addFields': { 'unreadCount': '$unreadCount' } }, // Add unreadCount back to the root
      { '$sort': { 'timestamp': -1 } }, // Sort again by last message timestamp
      { '$limit': 100 } // Limit to 100 most recent conversations
    ]);

    // Populate sender and recipient details for each last message in the conversations array
    await User.populate(conversations, { path: 'sender', select: 'name profileImageUrl' });
    await User.populate(conversations, { path: 'recipient', select: 'name profileImageUrl' });

    res.json(conversations);
  } catch (err) {
    console.error('getConversations error: Caught an exception:', err.message, err.stack);
    res.status(500).json({ message: 'Server error fetching conversations', error: err.message });
  }
};

// @desc    Delete a specific message
// @route   DELETE /api/messages/:messageId
// @access  Private (sender or admin only)
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Validate messageId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID format' });
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user can delete this message (sender or admin)
    if (message.sender.toString() !== currentUserId && currentUserRole !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    // Emit real-time update to both sender and recipient via Socket.IO
    const io = getIo();
    if (io) {
      io.to(message.sender.toString()).emit('messageDeleted', { messageId, conversationId: message.conversationId });
      io.to(message.recipient.toString()).emit('messageDeleted', { messageId, conversationId: message.conversationId });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('deleteMessage error: Caught an exception:', err.message, err.stack);
    res.status(500).json({ message: 'Server error deleting message', error: err.message });
  }
};

// @desc    Clear all messages in a conversation (for current user only)
// @route   DELETE /api/messages/conversation/:otherUserId
// @access  Private
exports.clearConversation = async (req, res) => {
  try {
    console.log('clearConversation: Request received');
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;
    
    console.log('clearConversation: otherUserId:', otherUserId);
    console.log('clearConversation: currentUserId:', currentUserId);

    // Validate otherUserId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      console.log('clearConversation: Invalid otherUserId format');
      return res.status(400).json({ message: 'Invalid other user ID format' });
    }

    // Note: We don't actually delete messages from the database
    // This is just a signal to the frontend to clear the current user's view
    // Each user maintains their own conversation state

    // Emit real-time update only to the current user via Socket.IO
    const io = getIo();
    if (io) {
      console.log('clearConversation: Emitting conversationCleared event to user:', currentUserId);
      io.to(currentUserId).emit('conversationCleared', { 
        otherUserId,
        message: 'Conversation cleared for current user only'
      });
    } else {
      console.log('clearConversation: Socket.IO not available');
    }

    console.log('clearConversation: Success - sending response');
    res.json({ 
      message: 'Conversation cleared successfully for current user', 
      note: 'Messages are preserved for other users'
    });
  } catch (err) {
    console.error('clearConversation error: Caught an exception:', err.message, err.stack);
    res.status(500).json({ message: 'Server error clearing conversation', error: err.message });
  }
};