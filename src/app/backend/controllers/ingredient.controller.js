const mongoose = require('mongoose');
const Ingredient = require('../models/ingredient.model');

const getIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    return res.status(200).json(ingredients);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const getIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    return res.status(200).json(ingredient);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const createIngredient = async (req, res) => {
  try {
    const { name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, unit } = req.body;

    const existing = await Ingredient.findOne({ name });
    if (existing) {
      return res.status(403).json({ message: 'Ingredient already exists' });
    }

    const ingredient = await new Ingredient({
      name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, unit
    }).save();

    return res.status(201).json(ingredient);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    const updated = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    return res.status(200).json(updated);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const deleteIngredient = async (req, res) => {
  try {
    const result = await Ingredient.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    return res.status(200).json({ message: 'Ingredient deleted' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { getIngredients, getIngredient, createIngredient, updateIngredient, deleteIngredient };