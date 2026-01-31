const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
};

const goalOffsets = {
  lose: -500,
  maintain: 0,
  gain: 500
};

const calculateMetrics = ({ age, gender, height, weight, activityLevel, goal }) => {
  // BMI
  const bmi = weight / Math.pow(height / 100, 2);

  // BMR
  const base = 10 * weight + 6.25 * height - 5 * age;
  let bmr;
  if (gender === 'male') bmr = base + 5;
  else if (gender === 'female') bmr = base - 161;
  else bmr = (base + 5 + base - 161) / 2;

  // TDEE
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

  // Target Calories
  const targetCalories = tdee + (goalOffsets[goal] || 0);

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories)
  };
};

module.exports = { calculateMetrics };