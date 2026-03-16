const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'expired'
  },
  subscriptionEnd: Date,
  pendingRequest: {
    type: Boolean,
    default: false
  },
  lastGrantedAt: Date
});

const Subscription = mongoose.model('subscription', subscriptionSchema);
module.exports = Subscription;