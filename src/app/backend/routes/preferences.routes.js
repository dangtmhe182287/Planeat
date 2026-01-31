const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/auth.controller');
const { getPreferences, createPreferences, updatePreferences } = require('../controllers/preferences.controller');

router.get('/', verifyToken, getPreferences);
router.post('/', verifyToken, createPreferences);
router.put('/', verifyToken, updatePreferences);

module.exports = router;