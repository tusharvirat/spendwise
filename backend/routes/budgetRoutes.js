const express = require('express');
const { body } = require('express-validator');
const { getBudgets, upsertBudget, bulkUpsertBudgets, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getBudgets);
router.post(
  '/',
  [
    body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be YYYY-MM format'),
    body('category').notEmpty().withMessage('Category required'),
    body('limit').isFloat({ gt: 0 }).withMessage('Limit must be a positive number'),
  ],
  upsertBudget
);
router.post('/bulk', bulkUpsertBudgets);
router.delete('/:id', deleteBudget);

module.exports = router;
