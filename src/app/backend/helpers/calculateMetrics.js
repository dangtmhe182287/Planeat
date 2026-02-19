// calculateMetrics.js
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

// Macro ratios based on goal
const macroRatios = {
  lose: { protein: 0.35, fat: 0.25, carbs: 0.40 },
  maintain: { protein: 0.30, fat: 0.30, carbs: 0.40 },
  gain: { protein: 0.25, fat: 0.30, carbs: 0.45 }
};

const calculateMetrics = ({ age, gender, height, weight, activityLevel, goal }) => {
  const bmi = weight / Math.pow(height / 100, 2);

  const base = 10 * weight + 6.25 * height - 5 * age;
  let bmr;
  if (gender === 'male') bmr = base + 5;
  else if (gender === 'female') bmr = base - 161;
  else bmr = (base + 5 + base - 161) / 2;

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
  const targetCalories = tdee + (goalOffsets[goal] || 0);

  const ratios = macroRatios[goal] || macroRatios.maintain;
  const targetProtein = Math.round((targetCalories * ratios.protein) / 4);
  const targetCarbs = Math.round((targetCalories * ratios.carbs) / 4);
  const targetFat = Math.round((targetCalories * ratios.fat) / 9);

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    targetProtein,
    targetCarbs,
    targetFat
  };
};

// Calculate total nutrition for a meal by summing across all its dishes
// Meal must be populated: dishes -> ingredients.ingredientId
const calculateMealNutrition = (meal) => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const dish of meal.dishes) {
    for (const item of dish.ingredients) {
      const ingredient = item.ingredientId;
      const multiplier = item.amount / 100;

      totalCalories += ingredient.caloriesPer100g * multiplier;
      totalProtein += ingredient.proteinPer100g * multiplier;
      totalCarbs += ingredient.carbsPer100g * multiplier;
      totalFat += ingredient.fatPer100g * multiplier;
    }
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10
  };
};

// Score a meal combination against targets
// Returns a score where 0 is perfect — penalizes anything outside +-15-20% range
const scoreMealPlan = (nutrition, targets) => {
  const tolerance = 0.175; // midpoint of 15-20%

  const caloriesDiff = Math.abs(nutrition.calories - targets.calories) / targets.calories;
  const proteinDiff = Math.abs(nutrition.protein - targets.protein) / targets.protein;
  const carbsDiff = Math.abs(nutrition.carbs - targets.carbs) / targets.carbs;
  const fatDiff = Math.abs(nutrition.fat - targets.fat) / targets.fat;

  // Heavy penalty for going beyond tolerance threshold
  const penalty = (diff) => diff <= tolerance ? diff : diff + (diff - tolerance) * 5;

  return penalty(caloriesDiff) + penalty(proteinDiff) + penalty(carbsDiff) + penalty(fatDiff);
};

module.exports = { calculateMetrics, calculateMealNutrition, scoreMealPlan };