const mongoose = require('mongoose');
const Preferences = require('../models/preferences.model');

const getPreferences = async (req, res) => {
  try {
    const preferences = await Preferences.findOne({ userId: req.userId });
    if (!preferences) {
      return res.status(404).json({ message: 'Preferences not found' });
    }
    return res.status(200).json(preferences);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const createPreferences = async (req, res) => {
  try {
    const existing = await Preferences.findOne({ userId: req.userId });
    if (existing) {
      return res.status(403).json({ message: 'Preferences already exist' });
    }

    const { dietType, allergies, mealsPerDay } = req.body;

    const preferences = await new Preferences({
      userId: req.userId,
      dietType,
      allergies,
      mealsPerDay
    }).save();

    return res.status(201).json(preferences);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const preferences = await Preferences.findOne({ userId: req.userId });
    if (!preferences) {
      return res.status(404).json({ message: 'Preferences not found' });
    }

    const updated = await Preferences.findOneAndUpdate(
      { userId: req.userId },
      {
        dietType: req.body.dietType ?? preferences.dietType,
        allergies: req.body.allergies ?? preferences.allergies,
        mealsPerDay: req.body.mealsPerDay ?? preferences.mealsPerDay
      },
      { new: true }
    );

    return res.status(200).json(updated);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { getPreferences, createPreferences, updatePreferences };