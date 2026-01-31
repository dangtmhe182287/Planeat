const mongoose = require('mongoose');
const Profile = require('../models/profile.model');
const { calculateMetrics } = require('../helpers/calculateMetrics');

const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    return res.status(200).json(profile);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const createProfile = async (req, res) => {
  try {
    const existing = await Profile.findOne({ userId: req.userId });
    if (existing) {
      return res.status(403).json({ message: 'Profile already exists' });
    }

    const { age, gender, height, weight, activityLevel, goal } = req.body;
    const metrics = calculateMetrics({ age, gender, height, weight, activityLevel, goal });

    const profile = await new Profile({
      userId: req.userId,
      age, gender, height, weight, activityLevel, goal,
      ...metrics
    }).save();

    return res.status(201).json(profile);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const merged = {
      age: req.body.age ?? profile.age,
      gender: req.body.gender ?? profile.gender,
      height: req.body.height ?? profile.height,
      weight: req.body.weight ?? profile.weight,
      activityLevel: req.body.activityLevel ?? profile.activityLevel,
      goal: req.body.goal ?? profile.goal
    };

    const metrics = calculateMetrics(merged);

    const updated = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { ...merged, ...metrics },
      { new: true }
    );

    return res.status(200).json(updated);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const result = await Profile.findOneAndDelete({ userId: req.userId });
    if (!result) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    return res.status(200).json({ message: 'Profile deleted' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { getProfile, createProfile, updateProfile, deleteProfile };