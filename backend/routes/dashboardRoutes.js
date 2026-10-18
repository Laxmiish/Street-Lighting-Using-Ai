const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/kpis', dashboardController.getKpis);
router.get('/corridors', dashboardController.getCorridors);
router.get('/energy-chart', dashboardController.getEnergyChart);

module.exports = router;
