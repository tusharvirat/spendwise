const express = require('express');
const { body } = require('express-validator');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const txValidation = [
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Valid date required'),
];

router.use(protect);

router.get('/summary', getSummary);
router.get('/', getTransactions);
router.post('/', txValidation, createTransaction);
router.put('/:id', txValidation, updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
