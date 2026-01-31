const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const emailVerificationSchema = new mongoose.Schema({
  email: {type: String, required: true},
  code: {type: String, required: true},
  attempts:{type: Number, default:0},
  expiresAt: {type: Date, required: true},
  
}, {timestamps: true});

const User = mongoose.model('user', userSchema);
const EmailVerification = mongoose.model('emailVerification', emailVerificationSchema);
module.exports = {User, EmailVerification};