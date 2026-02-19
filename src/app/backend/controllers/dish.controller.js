// dish.controller.js
const Dish = require('../models/dish.model');
const Ingredient = require('../models/ingredient.model');

const getDishes = async (req, res) => {
  try {
    const { mealType, dietType, allergen } = req.query;
    const filter = {};

    if (mealType) filter.mealType = { $in: [mealType] };
    if (dietType) filter.dietTypes = dietType;
    if (allergen) filter.excludesAllergens = allergen;

    const dishes = await Dish.find(filter).populate('ingredients.ingredientId');
    return res.status(200).json(dishes);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const getDish = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id).populate('ingredients.ingredientId');
    if (!dish) return res.status(404).json({ message: 'Dish not found' });
    return res.status(200).json(dish);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const createDish = async (req, res) => {
  try {
    const { name, mealType, ingredients, instructions, dietTypes, excludesAllergens, imageUrl } = req.body;

    // Verify all ingredients exist
    for (const item of ingredients) {
      const ingredient = await Ingredient.findById(item.ingredientId);
      if (!ingredient) {
        return res.status(400).json({ message: `Ingredient ${item.ingredientId} not found` });
      }
    }

    const dish = await new Dish({
      name, mealType, ingredients, instructions, dietTypes, excludesAllergens, imageUrl
    }).save();

    return res.status(201).json(dish);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const updateDish = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) return res.status(404).json({ message: 'Dish not found' });

    // If updating ingredients, verify they exist
    if (req.body.ingredients) {
      for (const item of req.body.ingredients) {
        const ingredient = await Ingredient.findById(item.ingredientId);
        if (!ingredient) {
          return res.status(400).json({ message: `Ingredient ${item.ingredientId} not found` });
        }
      }
    }

    const updated = await Dish.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('ingredients.ingredientId');

    return res.status(200).json(updated);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const deleteDish = async (req, res) => {
  try {
    const result = await Dish.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Dish not found' });
    return res.status(200).json({ message: 'Dish deleted' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { getDishes, getDish, createDish, updateDish, deleteDish };