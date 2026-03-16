const Transaction = require('../models/Transaction');

// @desc    Monthly report with category breakdown
// @route   GET /api/reports/monthly?month=YYYY-MM
const getMonthlyReport = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: 'month query param required (YYYY-MM)' });

    const [year, m] = month.split('-').map(Number);
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59);

    const [summary, categoryBreakdown, dailyTrend] = await Promise.all([
      // Total income vs expense
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      // Spending by category
      Transaction.aggregate([
        { $match: { user: req.user._id, type: 'expense', date: { $gte: start, $lte: end } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      // Daily spending trend
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { day: { $dayOfMonth: '$date' }, type: '$type' },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.day': 1 } },
      ]),
    ]);

    const summaryMap = summary.reduce((acc, s) => { acc[s._id] = s; return acc; }, {});
    const totalExpense = summaryMap.expense?.total || 0;

    res.json({
      month,
      summary: {
        income: summaryMap.income?.total || 0,
        expense: totalExpense,
        net: (summaryMap.income?.total || 0) - totalExpense,
        savingsRate: summaryMap.income?.total
          ? Math.round((1 - totalExpense / summaryMap.income.total) * 100)
          : 0,
      },
      categoryBreakdown: categoryBreakdown.map((c) => ({
        ...c,
        percentage: totalExpense ? Math.round((c.total / totalExpense) * 100) : 0,
      })),
      dailyTrend,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Year overview — all 12 months
// @route   GET /api/reports/yearly?year=YYYY
const getYearlyReport = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);

    const monthly = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Build 12-month grid
    const grid = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    monthly.forEach(({ _id, total }) => {
      const row = grid[_id.month - 1];
      row[_id.type] = total;
    });

    const totals = grid.reduce(
      (acc, m) => {
        acc.income += m.income;
        acc.expense += m.expense;
        return acc;
      },
      { income: 0, expense: 0 }
    );

    res.json({ year, monthly: grid, totals, net: totals.income - totals.expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Available months that have transactions
// @route   GET /api/reports/months
const getAvailableMonths = async (req, res) => {
  try {
    const months = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    const formatted = months.map(({ _id }) => ({
      key: `${_id.year}-${String(_id.month).padStart(2, '0')}`,
      label: new Date(_id.year, _id.month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMonthlyReport, getYearlyReport, getAvailableMonths };
