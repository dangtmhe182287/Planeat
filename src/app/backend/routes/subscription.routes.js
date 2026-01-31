const express = require('express');
const router = express.Router();

router.get('/status', async (req, res) => {
  res.json({ message: 'Get subscription status route' });
});

module.exports = router;