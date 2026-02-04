const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  date: {
    type: Date
  },
  breakfast: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'meal'
  },
  lunch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'meal'
  },
  dinner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'meal'
  },
});

const MealPlan = mongoose.model('mealPlan', mealPlanSchema);
module.exports = MealPlan;