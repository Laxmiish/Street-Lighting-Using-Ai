/**
 * LuminaAI — Master API Router Aggregator
 * Dispatches domain requests to isolated route handlers.
 */

const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./dashboardRoutes');
const poleRoutes = require('./poleRoutes');
const telemetryRoutes = require('./telemetryRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const recordsRoutes = require('./recordsRoutes');
const alertRoutes = require('./alertRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const aiRoutes = require('./aiRoutes');
const authRoutes = require('./authRoutes');
const demoRoutes = require('./demoRoutes');

router.use('/auth', authRoutes);
router.use('/simulation', demoRoutes);
router.use('/demo', demoRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/poles', poleRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/records', recordsRoutes);
router.use('/alerts', alertRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);

// Health check endpoint under /api
router.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'LuminaAI Municipal Street Lighting Platform',
    timestamp: new Date().toISOString(),
    version: '2.4.0',
    compliance: ['IRC:SP:72', 'SDG 7', 'SDG 11', 'SDG 13'],
  });
});

module.exports = router;
