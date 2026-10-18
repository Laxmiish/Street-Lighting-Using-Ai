const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/sdgs', analyticsController.getSdgMetrics);
router.get('/hourly', analyticsController.getHourlyBenchmarks);

module.exports = router;
