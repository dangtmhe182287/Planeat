const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: String,
  mealType: String,
  dishes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'dish'
  }],
  dietTypes: [String],
  excludesAllergens: [String]
});

const Meal = mongoose.model('meal', mealSchema);
module.exports = Meal;