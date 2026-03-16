const express = require('express');
const { getMonthlyReport, getYearlyReport, getAvailableMonths } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/monthly', getMonthlyReport);
router.get('/yearly', getYearlyReport);
router.get('/months', getAvailableMonths);

module.exports = router;
