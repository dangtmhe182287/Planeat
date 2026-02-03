const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/auth.controller');
const { getMeals, getMeal, createMeal, updateMeal, deleteMeal } = require('../controllers/meal.controller');

router.get('/', verifyToken, getMeals);
router.get('/:id', verifyToken, getMeal);
router.post('/', verifyToken, createMeal);
router.put('/:id', verifyToken, updateMeal);
router.delete('/:id', verifyToken, deleteMeal);

module.exports = router;