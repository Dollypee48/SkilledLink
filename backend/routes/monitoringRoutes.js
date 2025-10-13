const express = require('express');
const router = express.Router();
const { getQueueStatus } = require('../utils/asyncEmailService');

// Email queue monitoring endpoint (admin only)
router.get('/email-queue', (req, res) => {
  try {
    const queueStatus = getQueueStatus();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...queueStatus
    });
  } catch (error) {
    console.error('Error getting queue status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get queue status'
    });
  }
});

// Health check endpoint with detailed information
router.get('/health', (req, res) => {
  try {
    const healthInfo = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
      version: process.version,
      emailQueue: getQueueStatus()
    };
    
    res.json(healthInfo);
  } catch (error) {
    console.error('Error getting health info:', error);
    res.status(500).json({
      status: 'ERROR',
      error: 'Failed to get health information'
    });
  }
});

module.exports = router;
