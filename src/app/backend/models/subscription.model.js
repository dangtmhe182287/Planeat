const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: String, // 'trial', 'active', 'expired', 'cancelled'
  trialStartDate: Date,
  trialEndDate: Date,
  stripeCustomerId: String,
  stripeSubscriptionId: String
});

const Subscription = mongoose.model('subscription', subscriptionSchema);
module.exports = Subscription;