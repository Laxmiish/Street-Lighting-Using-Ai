/**
 * LuminaAI — Simulation & Demo Lab Controller
 * Provides isolated sandbox controls for synthetic sensor telemetry,
 * fault injection, radar traffic surges, and database reset.
 */

const fs = require('fs');
const path = require('path');
const db = require('../../database/db');
const anomalyService = require('../services/anomalyService');
const auditService = require('../services/auditService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Re-seed the PostgreSQL database with clean municipal baseline data
 * Endpoint: POST /api/demo/seed
 */
exports.seedDatabase = asyncHandler(async (req, res) => {
  const initPath = path.join(__dirname, '../../database/init.sql');
  const seedPath = path.join(__dirname, '../../database/seed.sql');

  // 1. Ensure table schemas and extensions are created
  if (fs.existsSync(initPath)) {
    const initSql = fs.readFileSync(initPath, 'utf-8');
    await db.query(initSql);
  }

  // 2. Populate Lucknow City municipal assets and telemetry
  if (fs.existsSync(seedPath)) {
    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    await db.query(seedSql);
  }

  try {
    await auditService.logEvent({
      sector: 'Operations Control Center',
      eventType: 'Database Seeding',
      summary: 'Database initialized and seeded with Lucknow municipal infrastructure assets.',
      metric: 'Reset & Initialized',
      compliance: 'ISO 27001 Audit Ready',
      loggedBy: 'Simulation Lab Engine',
    });
  } catch (err) {
    // Non-blocking
  }

  res.json({
    success: true,
    message: 'Database schema and Lucknow municipal assets initialized successfully.',
  });
});

/**
 * Inject a synthetic fault to test non-technical alerts & maintenance workflows
 * Endpoint: POST /api/demo/inject-fault
 */
exports.injectFault = asyncHandler(async (req, res) => {
  const { poleId = 'pole-06', faultType = 'NO_POWER' } = req.body;

  let currentBrightness = 80;
  let currentAmps = 0.0;
  let powerConsumedKwh = 0.0;
  let lumenOutput = 0;
  let internalTempCelsius = 28.0;

  if (faultType === 'BULB_BURNOUT') {
    currentAmps = 0.85;
    powerConsumedKwh = 0.18;
    lumenOutput = 0;
  } else if (faultType === 'HIGH_TEMPERATURE') {
    internalTempCelsius = 82.5;
    currentAmps = 0.70;
    powerConsumedKwh = 0.15;
    lumenOutput = 16000;
  }

  const result = await anomalyService.auditTelemetry({
    poleId,
    currentBrightness,
    currentAmps,
    powerConsumedKwh,
    internalTempCelsius,
    lumenOutput,
  });

  res.json({
    success: true,
    message: `Synthetic fault '${faultType}' injected for pole ${poleId}.`,
    data: result,
  });
});

/**
 * Trigger synthetic radar motion surge on a corridor
 * Endpoint: POST /api/demo/simulate-traffic
 */
exports.simulateTraffic = asyncHandler(async (req, res) => {
  const { zone = 'Zone 4: Gomti Nagar', density = 'HIGH' } = req.body;
  const targetBrightness = density === 'HIGH' ? 95 : density === 'MEDIUM' ? 60 : 25;

  await db.query(
    `UPDATE poles 
     SET current_brightness = $1, motion_detected = $2, status = 'ACTIVE' 
     WHERE (zone = $3 OR zone ILIKE $4) AND status != 'FAULTY'`,
    [targetBrightness, density === 'HIGH', zone, `%${zone}%`]
  );

  res.json({
    success: true,
    message: `Simulated ${density} traffic on ${zone}. Brightness adjusted to ${targetBrightness}%.`,
  });
});
