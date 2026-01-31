const MealPlan = require('../models/mealPlan.model');
const Meal = require('../models/meal.model');

const getMealPlan = async (req, res) => {
  try {
    const { date } = req.query;
    const plan = await MealPlan.findOne({ userId: req.userId, date })
      .populate('breakfast')
      .populate('lunch')
      .populate('dinner');

    if (!plan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    return res.status(200).json(plan);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const createMealPlan = async (req, res) => {
  try {
    const { date, breakfast, lunch, dinner } = req.body;

    const existing = await MealPlan.findOne({ userId: req.userId, date });
    if (existing) {
      return res.status(403).json({ message: 'Meal plan already exists for this date' });
    }

    const meals = [breakfast, lunch, dinner].filter(Boolean);
    for (const mealId of meals) {
      const meal = await Meal.findById(mealId);
      if (!meal) {
        return res.status(400).json({ message: `Meal ${mealId} not found` });
      }
    }

    const plan = await new MealPlan({
      userId: req.userId,
      date,
      breakfast,
      lunch,
      dinner
    }).save();

    return res.status(201).json(plan);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const swapMeal = async (req, res) => {
  try {
    const { date, slot, mealId } = req.body; // slot: 'breakfast', 'lunch', or 'dinner'

    const plan = await MealPlan.findOne({ userId: req.userId, date });
    if (!plan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res.status(400).json({ message: 'Meal not found' });
    }

    plan[slot] = mealId;
    await plan.save();

    return res.status(200).json(plan);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const deleteMealPlan = async (req, res) => {
  try {
    const { date } = req.query;
    const result = await MealPlan.findOneAndDelete({ userId: req.userId, date });
    if (!result) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    return res.status(200).json({ message: 'Meal plan deleted' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { getMealPlan, createMealPlan, swapMeal, deleteMealPlan };