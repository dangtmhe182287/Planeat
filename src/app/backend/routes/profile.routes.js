const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/auth.controller');
const { getProfile, createProfile, updateProfile, deleteProfile } = require('../controllers/profile.controller');

router.get('/', verifyToken, getProfile);
router.post('/', verifyToken, createProfile);
router.put('/', verifyToken, updateProfile);
router.delete('/', verifyToken, deleteProfile);

module.exports = router;