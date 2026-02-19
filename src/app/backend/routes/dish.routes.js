// dish.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/auth.controller');
const { getDishes, getDish, createDish, updateDish, deleteDish } = require('../controllers/dish.controller');

router.get('/', verifyToken, getDishes);
router.get('/:id', verifyToken, getDish);
router.post('/', verifyToken, createDish);
router.put('/:id', verifyToken, updateDish);
router.delete('/:id', verifyToken, deleteDish);

module.exports = router;