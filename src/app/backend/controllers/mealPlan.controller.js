const MealPlan = require('../models/mealPlan.model');
const Meal = require('../models/meal.model');
const Ingredient = require('../models/ingredient.model');
const Profile = require('../models/profile.model');
const Preferences = require('../models/preferences.model');
const { calculateMealNutrition } = require('../helpers/calculateMetrics');

const getMealPlan = async (req, res) => {
  try {
    const { date } = req.query;
    console.log(`Fetching meal plan for userId: ${req.userId}, date: ${date}`);
    
    const plan = await MealPlan.findOne({ userId: req.userId, date })
      .populate({
        path: 'breakfast',
        populate: { path: 'ingredients.ingredientId' }
      })
      .populate({
        path: 'lunch',
        populate: { path: 'ingredients.ingredientId' }
      })
      .populate({
        path: 'dinner',
        populate: { path: 'ingredients.ingredientId' }
      });

    if (!plan) {
      console.log('No meal plan found');
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    console.log('Meal plan found:', {
      breakfast: plan.breakfast ? plan.breakfast.name : null,
      lunch: plan.lunch ? plan.lunch.name : null,
      dinner: plan.dinner ? plan.dinner.name : null
    });
    
    return res.status(200).json(plan);
  } catch (e) {
    console.error('Error in getMealPlan:', e);
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
    const { date, slot, mealId } = req.body;

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

    // Check if a plan already exists and delete it if regenerating
    const existing = await MealPlan.findOne({ userId: req.userId, date });
    if (existing) {
      console.log('Deleting existing meal plan before regenerating');
      await MealPlan.findOneAndDelete({ userId: req.userId, date });
    }

    const profile = await Profile.findOne({ userId: req.userId });
    const preferences = await Preferences.findOne({ userId: req.userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
    }
    if (!preferences) {
      return res.status(404).json({ message: 'Preferences not found. Please set your preferences first.' });
    }

    const targets = {
      calories: profile.targetCalories,
      protein: profile.targetProtein,
      carbs: profile.targetCarbs,
      fat: profile.targetFat
    };

    const filter = {};
    
    if (preferences.dietType && preferences.dietType !== 'standard') {
      filter.dietTypes = preferences.dietType;
    }
    
    if (preferences.allergies && preferences.allergies.length > 0) {
      filter.excludesAllergens = { $all: preferences.allergies };
    }

    const breakfastOptions = await Meal.find({ mealType: { $in: ['breakfast'] } })
      .populate('ingredients.ingredientId');
    const lunchOptions = await Meal.find({ mealType: { $in: ['lunch'] } })
      .populate('ingredients.ingredientId');
    const dinnerOptions = await Meal.find({ mealType: { $in: ['dinner'] } })
      .populate('ingredients.ingredientId');

    console.log(`Found ${breakfastOptions.length} breakfast, ${lunchOptions.length} lunch, ${dinnerOptions.length} dinner`);

    if (breakfastOptions.length === 0 || lunchOptions.length === 0 || dinnerOptions.length === 0) {
      return res.status(404).json({ 
        message: `Not enough meals. Found: ${breakfastOptions.length} breakfast, ${lunchOptions.length} lunch, ${dinnerOptions.length} dinner` 
      });
    }

    const bestPlan = findBestMealCombination(breakfastOptions, lunchOptions, dinnerOptions, targets);

    if (!bestPlan) {
      return res.status(404).json({ message: 'Could not find a meal combination.' });
    }

    const plan = await new MealPlan({
      userId: req.userId,
      date,
      breakfast: bestPlan.breakfast._id,
      lunch: bestPlan.lunch._id,
      dinner: bestPlan.dinner._id
    }).save();

    await plan.populate({
      path: 'breakfast',
      populate: { path: 'ingredients.ingredientId' }
    });
    await plan.populate({
      path: 'lunch',
      populate: { path: 'ingredients.ingredientId' }
    });
    await plan.populate({
      path: 'dinner',
      populate: { path: 'ingredients.ingredientId' }
    });

    return res.status(201).json({ plan, nutrition: bestPlan.nutrition, targets });

  } catch (e) {
    console.error('Generate error:', e);
    return res.status(500).json({ error: e.message });
  }
};

function findBestMealCombination(breakfasts, lunches, dinners, targets) {
  let bestScore = Infinity;
  let bestPlan = null;

  const attempts = Math.min(100, breakfasts.length * lunches.length * dinners.length);
  
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

    const score = 
      Math.abs(totalNutrition.calories - targets.calories) +
      Math.abs(totalNutrition.protein - targets.protein) * 2 +
      Math.abs(totalNutrition.carbs - targets.carbs) +
      Math.abs(totalNutrition.fat - targets.fat) * 1.5;

    if (score < bestScore) {
      bestScore = score;
      bestPlan = { breakfast, lunch, dinner, nutrition: totalNutrition, score };
    }
  }

  return bestPlan;
}

module.exports = { getMealPlan, createMealPlan, swapMeal, deleteMealPlan, generateMealPlan };