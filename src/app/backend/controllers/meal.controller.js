const mongoose = require('mongoose');
const Meal = require('../models/meal.model');
const Ingredient = require('../models/ingredient.model');

const getMeals = async (req, res) => {
  try {
    const { mealType, dietType } = req.query;
    const filter = {};
    
    if (mealType) filter.mealType = mealType;
    if (dietType) filter.dietTypes = dietType;

    const meals = await Meal.find(filter).populate('ingredients.ingredientId');
    return res.status(200).json(meals);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const getMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('ingredients.ingredientId');
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
    const { name, mealType, ingredients, instructions, dietTypes, excludesAllergens, imageUrl } = req.body;

    // Verify all ingredients exist
    for (const item of ingredients) {
      const ingredient = await Ingredient.findById(item.ingredientId);
      if (!ingredient) {
        return res.status(400).json({ message: `Ingredient ${item.ingredientId} not found` });
      }
    }

    const meal = await new Meal({
      name,
      mealType,
      ingredients,
      instructions,
      dietTypes,
      excludesAllergens,
      imageUrl
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

    // If updating ingredients, verify they exist
    if (req.body.ingredients) {
      for (const item of req.body.ingredients) {
        const ingredient = await Ingredient.findById(item.ingredientId);
        if (!ingredient) {
          return res.status(400).json({ message: `Ingredient ${item.ingredientId} not found` });
        }
      }
    }

    const updated = await Meal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('ingredients.ingredientId');

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