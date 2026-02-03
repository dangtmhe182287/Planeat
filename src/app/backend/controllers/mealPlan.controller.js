const MealPlan = require('../models/mealPlan.model');
const Meal = require('../models/meal.model');
const Profile = require('../models/profile.model');
const Preferences = require('../models/preferences.model');
const { calculateMealNutrition } = require('../helpers/calculateMetrics');

const getMealPlan = async (req, res) => {
  try {
    const { date } = req.query;
    const plan = await MealPlan.findOne({ userId: req.userId, date })
      .populate('breakfast')
      .populate('lunch')
      .populate('dinner');

    if (!plan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    return res.status(200).json(plan);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const createMealPlan = async (req, res) => {
  try {
    const { date, breakfast, lunch, dinner } = req.body;

    const existing = await MealPlan.findOne({ userId: req.userId, date });
    if (existing) {
      return res.status(403).json({ message: 'Meal plan already exists for this date' });
    }

    const meals = [breakfast, lunch, dinner].filter(Boolean);
    for (const mealId of meals) {
      const meal = await Meal.findById(mealId);
      if (!meal) {
        return res.status(400).json({ message: `Meal ${mealId} not found` });
      }
    }

    const plan = await new MealPlan({
      userId: req.userId,
      date,
      breakfast,
      lunch,
      dinner
    }).save();

    return res.status(201).json(plan);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const swapMeal = async (req, res) => {
  try {
    const { date, slot, mealId } = req.body; // slot: 'breakfast', 'lunch', or 'dinner'

    const plan = await MealPlan.findOne({ userId: req.userId, date });
    if (!plan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res.status(400).json({ message: 'Meal not found' });
    }

    plan[slot] = mealId;
    await plan.save();

    return res.status(200).json(plan);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const deleteMealPlan = async (req, res) => {
  try {
    const { date } = req.query;
    const result = await MealPlan.findOneAndDelete({ userId: req.userId, date });
    if (!result) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    return res.status(200).json({ message: 'Meal plan deleted' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const generateMealPlan = async (req, res) => {
  try {
    const { date } = req.body;

    // Check if plan already exists for this date
    const existing = await MealPlan.findOne({ userId: req.userId, date });
    if (existing) {
      return res.status(403).json({ message: 'Meal plan already exists for this date' });
    }

    // Get user's profile and preferences
    const profile = await Profile.findOne({ userId: req.userId });
    const preferences = await Preferences.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
    }
    if (!preferences) {
      return res.status(404).json({ message: 'Preferences not found. Please set your preferences first.' });
    }

    // Target nutrition
    const targets = {
      calories: profile.targetCalories,
      protein: profile.targetProtein,
      carbs: profile.targetCarbs,
      fat: profile.targetFat
    };

    // Build query filter for meals
    const filter = {};
    
    // Filter by diet type if specified
    if (preferences.dietType && preferences.dietType !== 'standard') {
      filter.dietTypes = preferences.dietType;
    }
    
    // Filter by allergens - meal must exclude ALL user allergies
    if (preferences.allergies && preferences.allergies.length > 0) {
      filter.excludesAllergens = { $all: preferences.allergies };
    }

    // Get meals for each type and populate ingredients
    const breakfastOptions = await Meal.find({ ...filter, mealType: 'breakfast' })
      .populate('ingredients.ingredientId');
    const lunchOptions = await Meal.find({ ...filter, mealType: 'lunch' })
      .populate('ingredients.ingredientId');
    const dinnerOptions = await Meal.find({ ...filter, mealType: 'dinner' })
      .populate('ingredients.ingredientId');

    if (breakfastOptions.length === 0 || lunchOptions.length === 0 || dinnerOptions.length === 0) {
      return res.status(404).json({ 
        message: 'Not enough meals available matching your preferences. Please add more meals to the database.' 
      });
    }

    // Find best combination
    const bestPlan = findBestMealCombination(
      breakfastOptions,
      lunchOptions,
      dinnerOptions,
      targets
    );

    if (!bestPlan) {
      return res.status(404).json({ 
        message: 'Could not find a suitable meal combination. Try adjusting your preferences.' 
      });
    }

    // Create meal plan
    const plan = await new MealPlan({
      userId: req.userId,
      date,
      breakfast: bestPlan.breakfast._id,
      lunch: bestPlan.lunch._id,
      dinner: bestPlan.dinner._id
    }).save();

    // Return plan with nutrition info
    return res.status(201).json({
      plan,
      nutrition: bestPlan.nutrition,
      targets
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// Algorithm to find best meal combination
function findBestMealCombination(breakfasts, lunches, dinners, targets) {
  let bestScore = Infinity;
  let bestPlan = null;

  // Try up to 50 random combinations (balance between quality and speed)
  const attempts = Math.min(50, breakfasts.length * lunches.length * dinners.length);
  
  for (let i = 0; i < attempts; i++) {
    // Pick random meals
    const breakfast = breakfasts[Math.floor(Math.random() * breakfasts.length)];
    const lunch = lunches[Math.floor(Math.random() * lunches.length)];
    const dinner = dinners[Math.floor(Math.random() * dinners.length)];

    // Calculate nutrition
    const bNutrition = calculateMealNutrition(breakfast);
    const lNutrition = calculateMealNutrition(lunch);
    const dNutrition = calculateMealNutrition(dinner);

    const totalNutrition = {
      calories: bNutrition.calories + lNutrition.calories + dNutrition.calories,
      protein: bNutrition.protein + lNutrition.protein + dNutrition.protein,
      carbs: bNutrition.carbs + lNutrition.carbs + dNutrition.carbs,
      fat: bNutrition.fat + lNutrition.fat + dNutrition.fat
    };

    // Score based on distance from targets (lower is better)
    const score = 
      Math.abs(totalNutrition.calories - targets.calories) +
      Math.abs(totalNutrition.protein - targets.protein) * 2 + // Protein is important
      Math.abs(totalNutrition.carbs - targets.carbs) +
      Math.abs(totalNutrition.fat - targets.fat) * 1.5;

    // Check if within acceptable range (±15%)
    const caloriesInRange = Math.abs(totalNutrition.calories - targets.calories) <= targets.calories * 0.15;
    
    if (caloriesInRange && score < bestScore) {
      bestScore = score;
      bestPlan = {
        breakfast,
        lunch,
        dinner,
        nutrition: totalNutrition,
        score
      };
    }
  }

  return bestPlan;
}

module.exports = { getMealPlan, createMealPlan, swapMeal, deleteMealPlan, generateMealPlan };