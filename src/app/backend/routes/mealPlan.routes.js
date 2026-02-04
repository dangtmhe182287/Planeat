const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/auth.controller');
const { getMealPlan, createMealPlan, swapMeal, deleteMealPlan, generateMealPlan } = require('../controllers/mealPlan.controller');

router.get('/', verifyToken, getMealPlan);
router.post('/generate', verifyToken, generateMealPlan);
router.post('/', verifyToken, createMealPlan);
router.put('/swap', verifyToken, swapMeal);
router.delete('/', verifyToken, deleteMealPlan);

module.exports = router;