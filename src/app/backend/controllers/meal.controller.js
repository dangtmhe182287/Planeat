const mongoose = require('mongoose');
const Meal = require('../models/meal.model');
const Dish = require('../models/dish.model');

// Helper: derive dietTypes and excludesAllergens from a list of populated dishes
const deriveMealMeta = (dishes) => {
  // dietTypes = intersection (a meal is vegetarian only if ALL dishes are)
  const dietTypes = dishes.length > 0
    ? dishes[0].dietTypes.filter(dt => dishes.every(d => d.dietTypes.includes(dt)))
    : [];

  // excludesAllergens = intersection (a meal excludes an allergen only if ALL dishes do)
  const excludesAllergens = dishes.length > 0
    ? dishes[0].excludesAllergens.filter(a => dishes.every(d => d.excludesAllergens.includes(a)))
    : [];

  return { dietTypes, excludesAllergens };
};

const getMeals = async (req, res) => {
  try {
    const { mealType, dietType, allergen } = req.query;
    const filter = {};

    if (mealType) filter.mealType = mealType;
    if (dietType) filter.dietTypes = dietType;
    if (allergen) filter.excludesAllergens = allergen;

    const meals = await Meal.find(filter).populate({
      path: 'dishes',
      populate: { path: 'ingredients.ingredientId' }
    });

    return res.status(200).json(meals);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const getMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id).populate({
      path: 'dishes',
      populate: { path: 'ingredients.ingredientId' }
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    return res.status(200).json(meal);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const createMeal = async (req, res) => {
  try {
    const { name, mealType, dishes: dishIds } = req.body;

    // Verify all dishes exist
    const dishes = [];
    for (const id of dishIds) {
      const dish = await Dish.findById(id);
      if (!dish) {
        return res.status(400).json({ message: `Dish ${id} not found` });
      }
      dishes.push(dish);
    }

    // Derive dietTypes and excludesAllergens from the dishes
    const { dietTypes, excludesAllergens } = deriveMealMeta(dishes);

    const meal = await new Meal({
      name,
      mealType,
      dishes: dishIds,
      dietTypes,
      excludesAllergens
    }).save();

    return res.status(201).json(meal);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    const updateData = { ...req.body };

    // If dishes are being updated, re-derive dietTypes and excludesAllergens
    if (req.body.dishes) {
      const dishes = [];
      for (const id of req.body.dishes) {
        const dish = await Dish.findById(id);
        if (!dish) {
          return res.status(400).json({ message: `Dish ${id} not found` });
        }
        dishes.push(dish);
      }
      const { dietTypes, excludesAllergens } = deriveMealMeta(dishes);
      updateData.dietTypes = dietTypes;
      updateData.excludesAllergens = excludesAllergens;
    }

    const updated = await Meal.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate({
      path: 'dishes',
      populate: { path: 'ingredients.ingredientId' }
    });

    return res.status(200).json(updated);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const deleteMeal = async (req, res) => {
  try {
    const result = await Meal.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    return res.status(200).json({ message: 'Meal deleted' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { getMeals, getMeal, createMeal, updateMeal, deleteMeal };