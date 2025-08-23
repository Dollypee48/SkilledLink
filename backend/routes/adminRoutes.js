const express = require('express');
const router = express.Router();
const { verifyKYC, suspendUser, getAnalytics } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.put('/verify/:id', auth, role(['admin']), verifyKYC);
router.put('/suspend/:id', auth, role(['admin']), suspendUser);
router.get('/analytics', auth, role(['admin']), getAnalytics);

module.exports = router;