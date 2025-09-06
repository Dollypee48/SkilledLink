const express = require('express');
const router = express.Router();
const {
  getSubscriptionPlans,
  getCurrentSubscription,
  initializeSubscription,
  verifySubscriptionPayment,
  cancelSubscription,
  handleWebhook
} = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

// Public routes
router.get('/plans', getSubscriptionPlans);
router.post('/webhook', handleWebhook);

// Protected routes
router.get('/current', auth, getCurrentSubscription);
router.post('/initialize', auth, initializeSubscription);
router.post('/verify', auth, verifySubscriptionPayment);
router.post('/cancel', auth, cancelSubscription);

module.exports = router;
