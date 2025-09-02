const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', auth, messageController.sendMessage);

// @route   GET /api/messages/conversations
// @desc    Get all conversations for the logged-in user
// @access  Private
router.get('/conversations', auth, messageController.getConversations);

// @route   DELETE /api/messages/conversation/:otherUserId
// @desc    Clear all messages in a specific conversation
// @access  Private
router.delete('/conversation/:otherUserId', auth, messageController.clearConversation);

// @route   GET /api/messages/:otherUserId
// @desc    Get messages in a specific conversation
// @access  Private
router.get('/:otherUserId', auth, messageController.getConversation);

// @route   DELETE /api/messages/:messageId
// @desc    Delete a specific message
// @access  Private (sender or admin only)
router.delete('/:messageId', auth, messageController.deleteMessage);

module.exports = router;
