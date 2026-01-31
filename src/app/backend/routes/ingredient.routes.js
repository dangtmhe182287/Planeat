const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/auth.controller');
const { getIngredients, getIngredient, createIngredient, updateIngredient, deleteIngredient } = require('../controllers/ingredient.controller');

router.get('/', verifyToken, getIngredients);
router.get('/:id', verifyToken, getIngredient);
router.post('/', verifyToken, createIngredient);
router.put('/:id', verifyToken, updateIngredient);
router.delete('/:id', verifyToken, deleteIngredient);

module.exports = router;