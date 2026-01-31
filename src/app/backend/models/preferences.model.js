const mongoose = require("mongoose");

const preferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true, 
    required: true
  },
  dietType: String, // 'standard', 'vegetarian', 'vegan', etc.
  allergies: [String], // ['dairy', 'nuts']
  mealsPerDay: Number // 3, 4, or 5
});

const Preferences = mongoose.model('preferences', preferencesSchema);
module.exports = Preferences;
