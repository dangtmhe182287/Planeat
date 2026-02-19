const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: String,
  mealType: [String], // 'breakfast', 'lunch', 'dinner'
  dishType: {
    type: String,
    enum: ['rice', 'main', 'vegetable', 'soup'],
    required: true
  },
  ingredients: [{
    ingredientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ingredient'
    },
    amount: Number
  }],
  instructions: [String],
  dietTypes: [String], // ['vegetarian', 'vegan']
  excludesAllergens: [String], // ['dairy', 'nuts']
  imageUrl: String
});

const Dish = mongoose.model('dish', dishSchema);
module.exports = Dish;