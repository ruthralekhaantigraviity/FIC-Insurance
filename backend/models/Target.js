import mongoose from 'mongoose';

const targetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  month: {
    type: String, // YYYY-MM
    required: true
  },
  premiumTarget: {
    type: Number,
    default: 0
  },
  policyCountTarget: {
    type: Number,
    default: 0
  },
  dailyCallTarget: {
    type: Number,
    default: 50
  },
  followUpTarget: {
    type: Number,
    default: 0
  },
  renewalTarget: {
    type: Number,
    default: 0
  },
  achieved: {
    premium: { type: Number, default: 0 },
    policies: { type: Number, default: 0 },
    calls: { type: Number, default: 0 }
  },
  locked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Ensure unique target per user per month
targetSchema.index({ user: 1, month: 1 }, { unique: true });

export default mongoose.model('Target', targetSchema);
