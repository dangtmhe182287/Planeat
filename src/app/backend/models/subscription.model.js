const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  status: String, // 'trial', 'active', 'expired', 'cancelled'
  trialStartDate: Date,
  trialEndDate: Date,
  paypalSubscriptionId: String,
  lastPaymentDate: Date
});

const Subscription = mongoose.model('subscription', subscriptionSchema);
module.exports = Subscription;