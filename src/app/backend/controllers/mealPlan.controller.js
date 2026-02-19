// mealPlan.controller.js
const MealPlan = require('../models/mealPlan.model');
const Meal = require('../models/meal.model');
const Dish = require('../models/dish.model');
const Profile = require('../models/profile.model');
const Preferences = require('../models/preferences.model');
const { calculateMealNutrition, scoreMealPlan } = require('../helpers/calculateMetrics');

// Reusable populate config for meal -> dishes -> ingredients
const mealPopulate = {
  path: 'dishes',
  populate: { path: 'ingredients.ingredientId' }
};

const getMealPlan = async (req, res) => {
  try {
    const { date } = req.query;

    const plan = await MealPlan.findOne({ userId: req.userId, date })
      .populate({ path: 'breakfast', populate: mealPopulate })
      .populate({ path: 'lunch', populate: mealPopulate })
      .populate({ path: 'dinner', populate: mealPopulate });

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

    for (const mealId of [breakfast, lunch, dinner].filter(Boolean)) {
      const meal = await Meal.findById(mealId);
      if (!meal) {
        return res.status(400).json({ message: `Meal ${mealId} not found` });
      }
    }

    const plan = await new MealPlan({ userId: req.userId, date, breakfast, lunch, dinner }).save();
    return res.status(201).json(plan);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const swapMeal = async (req, res) => {
  try {
    const { date, slot, mealId } = req.body;

    const plan = await MealPlan.findOne({ userId: req.userId, date });
    if (!plan) return res.status(404).json({ message: 'Meal plan not found' });

    const meal = await Meal.findById(mealId);
    if (!meal) return res.status(400).json({ message: 'Meal not found' });

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
    if (!result) return res.status(404).json({ message: 'Meal plan not found' });
    return res.status(200).json({ message: 'Meal plan deleted' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const generateMealPlan = async (req, res) => {
  try {
    const { date } = req.body;

    // Delete existing plan for this date if regenerating
    await MealPlan.findOneAndDelete({ userId: req.userId, date });

    const profile = await Profile.findOne({ userId: req.userId });
    const preferences = await Preferences.findOne({ userId: req.userId });

    if (!profile) return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
    if (!preferences) return res.status(404).json({ message: 'Preferences not found. Please set your preferences first.' });

    const targets = {
      calories: profile.targetCalories,
      protein: profile.targetProtein,
      carbs: profile.targetCarbs,
      fat: profile.targetFat
    };

    // Build filter from user preferences
    const filter = {};
    if (preferences.dietType && preferences.dietType !== 'standard') filter.dietTypes = preferences.dietType;
    if (preferences.allergies?.length > 0) filter.excludesAllergens = { $all: preferences.allergies };

    // Step 1: Try to find pre-built meals that match filters
    let breakfastOptions = await getMealOptions('breakfast', filter);
    let lunchOptions = await getMealOptions('lunch', filter);
    let dinnerOptions = await getMealOptions('dinner', filter);

    // Step 2: If not enough pre-built meals, dynamically assemble from dishes
    if (breakfastOptions.length === 0) breakfastOptions = [await assembleMealFromDishes('breakfast', filter)].filter(Boolean);
    if (lunchOptions.length === 0) lunchOptions = [await assembleMealFromDishes('lunch', filter)].filter(Boolean);
    if (dinnerOptions.length === 0) dinnerOptions = [await assembleMealFromDishes('dinner', filter)].filter(Boolean);

    if (breakfastOptions.length === 0 || lunchOptions.length === 0 || dinnerOptions.length === 0) {
      return res.status(404).json({ message: 'Not enough meals or dishes available for your preferences.' });
    }

    const bestPlan = findBestMealCombination(breakfastOptions, lunchOptions, dinnerOptions, targets);

    if (!bestPlan) {
      return res.status(404).json({ message: 'Could not find a meal combination within nutrition targets.' });
    }

    const plan = await new MealPlan({
      userId: req.userId,
      date,
      breakfast: bestPlan.breakfast._id,
      lunch: bestPlan.lunch._id,
      dinner: bestPlan.dinner._id
    }).save();

    await plan.populate({ path: 'breakfast', populate: mealPopulate });
    await plan.populate({ path: 'lunch', populate: mealPopulate });
    await plan.populate({ path: 'dinner', populate: mealPopulate });

    return res.status(201).json({ plan, nutrition: bestPlan.nutrition, targets });
  } catch (e) {
    console.error('Generate error:', e);
    return res.status(500).json({ error: e.message });
  }
};

// Fetch pre-built meals with full dish/ingredient population
const getMealOptions = async (mealType, filter) => {
  return Meal.find({ mealType, ...filter }).populate({
    path: 'dishes',
    populate: { path: 'ingredients.ingredientId' }
  });
};

// Dynamically assemble a meal from dishes following Vietnamese meal structure:
// Always 1 rice dish + 1-3 from main/vegetable/soup
const assembleMealFromDishes = async (mealType, filter) => {
  const baseFilter = { mealType: { $in: [mealType] }, ...filter };

  // Always pick 1 rice dish
  const riceDishes = await Dish.find({ ...baseFilter, dishType: 'rice' }).populate('ingredients.ingredientId');
  if (riceDishes.length === 0) return null;
  const rice = riceDishes[Math.floor(Math.random() * riceDishes.length)];

  // Pick 1-3 dishes from main, vegetable, soup
  const otherDishes = await Dish.find({
    ...baseFilter,
    dishType: { $in: ['main', 'vegetable', 'soup'] }
  }).populate('ingredients.ingredientId');

  if (otherDishes.length === 0) return null;

  // Shuffle and pick 1-3
  const shuffled = otherDishes.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(3, shuffled.length));
  const allDishes = [rice, ...selected];
  const dishIds = allDishes.map(d => d._id);

  // Derive dietTypes and excludesAllergens from all selected dishes
  const dietTypes = allDishes[0].dietTypes.filter(dt => allDishes.every(d => d.dietTypes.includes(dt)));
  const excludesAllergens = allDishes[0].excludesAllergens.filter(a => allDishes.every(d => d.excludesAllergens.includes(a)));

  const meal = await new Meal({
    name: allDishes.map(d => d.name).join(' + '),
    mealType,
    dishes: dishIds,
    dietTypes,
    excludesAllergens
  }).save();

  return Meal.findById(meal._id).populate({
    path: 'dishes',
    populate: { path: 'ingredients.ingredientId' }
  });
};

// Find the best scoring combination of breakfast, lunch, dinner
function findBestMealCombination(breakfasts, lunches, dinners, targets) {
  let bestScore = Infinity;
  let bestPlan = null;

  const attempts = Math.min(200, breakfasts.length * lunches.length * dinners.length);

  for (let i = 0; i < attempts; i++) {
    const breakfast = breakfasts[Math.floor(Math.random() * breakfasts.length)];
    const lunch = lunches[Math.floor(Math.random() * lunches.length)];
    const dinner = dinners[Math.floor(Math.random() * dinners.length)];

    const bNutrition = calculateMealNutrition(breakfast);
    const lNutrition = calculateMealNutrition(lunch);
    const dNutrition = calculateMealNutrition(dinner);

    const totalNutrition = {
      calories: bNutrition.calories + lNutrition.calories + dNutrition.calories,
      protein: bNutrition.protein + lNutrition.protein + dNutrition.protein,
      carbs: bNutrition.carbs + lNutrition.carbs + dNutrition.carbs,
      fat: bNutrition.fat + lNutrition.fat + dNutrition.fat
    };

    const score = scoreMealPlan(totalNutrition, targets);

    if (score < bestScore) {
      bestScore = score;
      bestPlan = { breakfast, lunch, dinner, nutrition: totalNutrition, score };
    }
  }

  return bestPlan;
}

module.exports = { getMealPlan, createMealPlan, swapMeal, deleteMealPlan, generateMealPlan };