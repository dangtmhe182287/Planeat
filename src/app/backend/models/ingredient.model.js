const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: String,
  caloriesPer100g: Number,
  proteinPer100g: Number,
  carbsPer100g: Number,
  fatPer100g: Number,
  unit: String  // 'g', 'ml', 'item'
});

const Ingredient = mongoose.model('ingredient', ingredientSchema);
module.exports = Ingredient;