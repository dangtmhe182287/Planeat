const express = require('express');
const router = express.Router();
const { getStatus, createSubscription, cancelSubscription, webhook } = require('../controllers/subscription.controller');
const { verifyToken } = require('../controllers/auth.controller');

// Protected routes (require auth)
router.get('/status', verifyToken, getStatus);
router.post('/create', verifyToken, createSubscription);
router.post('/cancel', verifyToken, cancelSubscription);

// Public route (PayPal webhooks don't send auth tokens)
router.post('/webhook', webhook);

module.exports = router;