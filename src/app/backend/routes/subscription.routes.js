const express = require('express');
const router = express.Router();
const { getStatus, requestActivation, getPendingRequests, grantSubscription } = require('../controllers/subscription.controller');
const { verifyToken, isAdmin } = require('../controllers/auth.controller');

router.get('/status', verifyToken, getStatus);
router.post('/request', verifyToken, requestActivation);
router.get('/pending', verifyToken, isAdmin, getPendingRequests);
router.post('/grant', verifyToken, isAdmin, grantSubscription);

module.exports = router;