const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: String, // Format: "YYYY-MM"
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [1, 'Budget limit must be at least 1'],
    },
    alertThreshold: {
      type: Number,
      default: 90, // Alert at 90% by default
      min: 1,
      max: 100,
    },
  },
  { timestamps: true }
);

// One budget per user per category per month
budgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
