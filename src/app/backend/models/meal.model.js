const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: String,
  mealType: [String], // 'breakfast', 'lunch', 'dinner', 'snack'
  ingredients: [{
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient'
    },
    amount: Number
  }],
  instructions: [String],
  dietTypes: [String], // ['vegetarian', 'vegan']
  excludesAllergens: [String], // ['dairy', 'nuts']
  imageUrl: String
});

const Meal = mongoose.model('meal', mealSchema);
module.exports = Meal;