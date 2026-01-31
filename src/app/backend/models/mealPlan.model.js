const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date
  },
  breakfast: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal'
  },
  lunch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal'
  },
  dinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal'
  },
});

const MealPlan = mongoose.model('mealPlan', mealPlanSchema);
module.exports = MealPlan;