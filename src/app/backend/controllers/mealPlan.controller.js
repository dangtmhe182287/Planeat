const MealPlan = require('../models/mealPlan.model');
const Meal = require('../models/meal.model');
const Dish = require('../models/dish.model');
const Profile = require('../models/profile.model');
const Preferences = require('../models/preferences.model');
const { calculateMealNutrition, scoreMealPlan } = require('../helpers/calculateMetrics');

// How many random candidate meals to generate per slot before scoring
const CANDIDATE_COUNT = 8;

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

    // Fetch all available dishes once (avoid repeated DB calls inside loops)
    const allCompleteDishes = {
      breakfast: await Dish.find({ mealType: { $in: ['breakfast'] }, dishType: 'complete_meal', ...filter }).populate('ingredients.ingredientId'),
      lunch:     await Dish.find({ mealType: { $in: ['lunch'] },     dishType: 'complete_meal', ...filter }).populate('ingredients.ingredientId'),
      dinner:    await Dish.find({ mealType: { $in: ['dinner'] },    dishType: 'complete_meal', ...filter }).populate('ingredients.ingredientId'),
    };
    const riceDishes = await Dish.find({ dishType: 'rice', ...filter }).populate('ingredients.ingredientId');
    const sideDishes = await Dish.find({ dishType: { $in: ['main', 'vegetable', 'soup'] }, ...filter }).populate('ingredients.ingredientId');

    // Generate CANDIDATE_COUNT virtual meal options per slot (in memory, no DB save yet)
    const breakfastOptions = assembleOptions('breakfast', allCompleteDishes.breakfast, riceDishes, sideDishes);
    const lunchOptions     = assembleOptions('lunch',     allCompleteDishes.lunch,     riceDishes, sideDishes);
    const dinnerOptions    = assembleOptions('dinner',    allCompleteDishes.dinner,    riceDishes, sideDishes);

    if (breakfastOptions.length === 0 || lunchOptions.length === 0 || dinnerOptions.length === 0) {
      return res.status(404).json({ message: 'Not enough meals or dishes available for your preferences.' });
    }

    // Score all combinations and pick the best one
    const bestVirtual = findBestMealCombination(breakfastOptions, lunchOptions, dinnerOptions, targets);

    if (!bestVirtual) {
      return res.status(404).json({ message: 'Could not find a meal combination within nutrition targets.' });
    }

    // Only now save the 3 winning meals to the DB
    const savedBreakfast = await saveMeal(bestVirtual.breakfast, 'breakfast');
    const savedLunch     = await saveMeal(bestVirtual.lunch,     'lunch');
    const savedDinner    = await saveMeal(bestVirtual.dinner,    'dinner');

    const plan = await new MealPlan({
      userId: req.userId,
      date,
      breakfast: savedBreakfast._id,
      lunch: savedLunch._id,
      dinner: savedDinner._id
    }).save();

    await plan.populate({ path: 'breakfast', populate: mealPopulate });
    await plan.populate({ path: 'lunch', populate: mealPopulate });
    await plan.populate({ path: 'dinner', populate: mealPopulate });

    return res.status(201).json({ plan, nutrition: bestVirtual.nutrition, targets });
  } catch (e) {
    console.error('Generate error:', e);
    return res.status(500).json({ error: e.message });
  }
};

// Build CANDIDATE_COUNT virtual meal objects in memory from available dishes.
// Returns plain objects with { name, mealType, dishes (populated), dietTypes, excludesAllergens }.
// Nothing is saved to DB here.
const assembleOptions = (mealType, completeDishes, riceDishes, sideDishes) => {
  const options = [];
  const canComplete = completeDishes.length > 0;
  const canSpread = riceDishes.length > 0 && sideDishes.length > 0;

  for (let i = 0; i < CANDIDATE_COUNT; i++) {
    // If both types are available, alternate: even iterations = complete meal, odd = rice spread
    // This ensures variety in the candidate pool regardless of what dishes exist
    const useComplete = canComplete && (!canSpread || i % 2 === 0);

    if (useComplete) {
      const dish = completeDishes[Math.floor(Math.random() * completeDishes.length)];
      options.push({
        name: dish.name,
        mealType,
        dishes: [dish],
        dietTypes: dish.dietTypes || [],
        excludesAllergens: dish.excludesAllergens || []
      });
    } else if (canSpread) {
      // Build a Vietnamese spread: rice + 1-3 random sides
      const rice = riceDishes[Math.floor(Math.random() * riceDishes.length)];
      const shuffled = [...sideDishes].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(3, shuffled.length));
      const allDishes = [rice, ...selected];

      const dietTypes = allDishes[0].dietTypes
        ? allDishes[0].dietTypes.filter(dt => allDishes.every(d => d.dietTypes?.includes(dt)))
        : [];
      const excludesAllergens = allDishes[0].excludesAllergens
        ? allDishes[0].excludesAllergens.filter(a => allDishes.every(d => d.excludesAllergens?.includes(a)))
        : [];

      options.push({
        name: allDishes.map(d => d.name).join(' + '),
        mealType,
        dishes: allDishes,
        dietTypes,
        excludesAllergens
      });
    }
  }

  return options;
};

// Save a virtual meal object to the DB and return the saved document
const saveMeal = async (virtualMeal, mealType) => {
  const meal = await new Meal({
    name: virtualMeal.name,
    mealType,
    dishes: virtualMeal.dishes.map(d => d._id),
    dietTypes: virtualMeal.dietTypes,
    excludesAllergens: virtualMeal.excludesAllergens
  }).save();

  return Meal.findById(meal._id).populate({
    path: 'dishes',
    populate: { path: 'ingredients.ingredientId' }
  });
};

// Find the best scoring combination across all candidates
function findBestMealCombination(breakfasts, lunches, dinners, targets) {
  let bestScore = Infinity;
  let bestPlan = null;

  const attempts = Math.min(200, breakfasts.length * lunches.length * dinners.length);

  for (let i = 0; i < attempts; i++) {
    const breakfast = breakfasts[Math.floor(Math.random() * breakfasts.length)];
    const lunch     = lunches[Math.floor(Math.random() * lunches.length)];
    const dinner    = dinners[Math.floor(Math.random() * dinners.length)];

    const bNutrition = calculateMealNutrition(breakfast);
    const lNutrition = calculateMealNutrition(lunch);
    const dNutrition = calculateMealNutrition(dinner);

    const totalNutrition = {
      calories: bNutrition.calories + lNutrition.calories + dNutrition.calories,
      protein:  bNutrition.protein  + lNutrition.protein  + dNutrition.protein,
      carbs:    bNutrition.carbs    + lNutrition.carbs    + dNutrition.carbs,
      fat:      bNutrition.fat      + lNutrition.fat      + dNutrition.fat
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