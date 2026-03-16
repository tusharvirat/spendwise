const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');

// @desc    Get all transactions (with filters & pagination)
// @route   GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, search, page = 1, limit = 50 } = req.query;

    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate + 'T23:59:59');
    }
    if (search) filter.description = { $regex: search, $options: 'i' };

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      transactions,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
const createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const transaction = await Transaction.create({ ...req.body, user: req.user._id });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard summary
// @route   GET /api/transactions/summary
const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [monthlyStats, allTimeStats, recentTransactions] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.find({ user: req.user._id }).sort({ date: -1 }).limit(5),
    ]);

    const toMap = (arr) => arr.reduce((acc, item) => { acc[item._id] = item; return acc; }, {});

    res.json({
      monthly: toMap(monthlyStats),
      allTime: toMap(allTimeStats),
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction, getSummary };
