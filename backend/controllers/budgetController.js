const { validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get budgets for a month
// @route   GET /api/budgets?month=YYYY-MM
const getBudgets = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = { user: req.user._id };
    if (month) filter.month = month;

    const budgets = await Budget.find(filter).sort({ category: 1 });

    // Calculate spending for the month
    if (month) {
      const [year, m] = month.split('-').map(Number);
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59);

      const spending = await Transaction.aggregate([
        { $match: { user: req.user._id, type: 'expense', date: { $gte: start, $lte: end } } },
        { $group: { _id: '$category', spent: { $sum: '$amount' } } },
      ]);

      const spendMap = spending.reduce((acc, s) => { acc[s._id] = s.spent; return acc; }, {});

      const enriched = budgets.map((b) => ({
        ...b.toObject(),
        spent: spendMap[b.category] || 0,
        percentage: Math.round(((spendMap[b.category] || 0) / b.limit) * 100),
        status:
          (spendMap[b.category] || 0) >= b.limit
            ? 'exceeded'
            : (spendMap[b.category] || 0) >= (b.limit * b.alertThreshold) / 100
            ? 'warning'
            : 'ok',
      }));

      return res.json(enriched);
    }

    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upsert budget (create or update)
// @route   POST /api/budgets
const upsertBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { month, category, limit, alertThreshold } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month, category },
      { limit, alertThreshold: alertThreshold || 90 },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk upsert budgets for a month
// @route   POST /api/budgets/bulk
const bulkUpsertBudgets = async (req, res) => {
  try {
    const { month, budgets } = req.body; // budgets: [{ category, limit, alertThreshold }]
    if (!month || !Array.isArray(budgets)) {
      return res.status(400).json({ message: 'month and budgets array required' });
    }

    const ops = budgets.map(({ category, limit, alertThreshold }) => ({
      updateOne: {
        filter: { user: req.user._id, month, category },
        update: { $set: { limit, alertThreshold: alertThreshold || 90 } },
        upsert: true,
      },
    }));

    await Budget.bulkWrite(ops);
    const saved = await Budget.find({ user: req.user._id, month });
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    await budget.deleteOne();
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBudgets, upsertBudget, bulkUpsertBudgets, deleteBudget };
