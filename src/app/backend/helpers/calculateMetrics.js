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
// Protein: preserves muscle, keeps you full
// Fat: essential for hormones and absorption
// Carbs: primary energy source
const macroRatios = {
  lose: { protein: 0.35, fat: 0.25, carbs: 0.40 },      // Higher protein to preserve muscle while losing weight
  maintain: { protein: 0.30, fat: 0.30, carbs: 0.40 },  // Balanced distribution
  gain: { protein: 0.25, fat: 0.30, carbs: 0.45 }       // Higher carbs for energy to build muscle
};


const calculateMetrics = ({ age, gender, height, weight, activityLevel, goal }) => {
  // BMI (Body Mass Index) - weight status indicator
  const bmi = weight / Math.pow(height / 100, 2);

  // BMR (Basal Metabolic Rate) - calories burned at rest using Mifflin-St Jeor equation
  const base = 10 * weight + 6.25 * height - 5 * age;
  let bmr;
  if (gender === 'male') bmr = base + 5;
  else if (gender === 'female') bmr = base - 161;
  else bmr = (base + 5 + base - 161) / 2;

  // TDEE (Total Daily Energy Expenditure) - total calories burned per day including activity
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

  // Target Calories - adjusted based on goal (±500 for lose/gain ~1lb per week)
  const targetCalories = tdee + (goalOffsets[goal] || 0);

  // Calculate macronutrient targets in grams
  // Protein & Carbs: 4 calories per gram
  // Fat: 9 calories per gram
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

// Calculate total nutrition for a meal
// Meal must be populated with ingredient details
const calculateMealNutrition = (meal) => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  // Loop through each ingredient in the meal
  for (const item of meal.ingredients) {
    const ingredient = item.ingredientId;
    const amount = item.amount; // grams or ml

    // Calculate nutrition based on amount (ingredient values are per 100g)
    const multiplier = amount / 100;
    
    totalCalories += ingredient.caloriesPer100g * multiplier;
    totalProtein += ingredient.proteinPer100g * multiplier;
    totalCarbs += ingredient.carbsPer100g * multiplier;
    totalFat += ingredient.fatPer100g * multiplier;
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10, // 1 decimal place
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10
  };
};

module.exports = { calculateMetrics, calculateMealNutrition };