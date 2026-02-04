const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  age: Number,
  gender: String, // 'male', 'female', 'other'
  height: Number, // cm
  weight: Number, // kg
  activityLevel: String, // 'sedentary', 'light', 'moderate', 'active', 'very_active'
  goal: String, // 'lose', 'maintain', 'gain'
  bmi: Number,
  bmr: Number,
  tdee: Number,
  targetCalories: Number,
  targetProtein: Number, // grams
  targetCarbs: Number, // grams
  targetFat: Number // grams
});

const Profile = mongoose.model('profile', profileSchema);
module.exports = Profile;