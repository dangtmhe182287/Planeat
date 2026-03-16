const Subscription = require('../models/subscription.model');
const { User } = require('../models/user.model');

const getStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.userId });

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    // Auto-expire if subscriptionEnd has passed
    if (subscription.status === 'active' && subscription.subscriptionEnd < new Date()) {
      subscription.status = 'expired';
      await subscription.save();
    }

    return res.status(200).json(subscription);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const requestActivation = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.userId },
      { pendingRequest: true },
      { new: true, upsert: true }
    );
    return res.status(200).json(subscription);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// Admin only
const getPendingRequests = async (req, res) => {
  try {
    const pending = await Subscription.find({ pendingRequest: true }).populate('userId', 'email');
    return res.status(200).json(pending);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// Admin only — grants 30 days, stacks if still active
const grantSubscription = async (req, res) => {
  try {
    const { userId } = req.body;

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const base = subscription.status === 'active' && subscription.subscriptionEnd > new Date()
      ? subscription.subscriptionEnd
      : new Date();

    const newEnd = new Date(base);
    newEnd.setDate(newEnd.getDate() + 30);

    subscription.status = 'active';
    subscription.subscriptionEnd = newEnd;
    subscription.pendingRequest = false;
    subscription.lastGrantedAt = new Date();
    await subscription.save();

    return res.status(200).json(subscription);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { getStatus, requestActivation, getPendingRequests, grantSubscription };