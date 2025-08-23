const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/initialize', auth, initializePayment);
router.post('/verify', auth, verifyPayment);

module.exports = router;