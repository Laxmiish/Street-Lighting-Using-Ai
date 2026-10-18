/**
 * LuminaAI — IoT Telemetry Ingestion & Real-Time Ingestion Controller
 * Primary gateway for ESP32 / LoRaWAN edge sensor data streaming.
 * Accepts exact hierarchical payloads (Zone -> Mini-Cluster -> Pole) per ai_config.md.
 */

const db = require('../../database/db');
const aiInferenceService = require('../services/aiInferenceService');
const anomalyService = require('../services/anomalyService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Ingest edge sensor telemetry packet
 * Endpoint: POST /api/telemetry
 */
exports.ingestTelemetry = asyncHandler(async (req, res) => {
  // Support both hierarchical JSON payload (ai_config.md Section 3) and flat payload
  const body = req.body;
  const zoneId = body.zone_id || body.zoneId || 'ZONE-GATEWAY-01';
  const miniClusterId = body.mini_cluster_id || body.miniClusterId || 'MC-SECTOR-01';
  const poleId = body.pole_id || body.poleId;

  if (!poleId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required pole identifier (pole_id or poleId).',
    });
  }

  // Extract sensor readings from nested 'sensors' object or root
  const sensors = body.sensors || {};
  const ambientLux = parseFloat(sensors.lux !== undefined ? sensors.lux : (body.ambientLux !== undefined ? body.ambientLux : 0.0));
  const motionDetected = Boolean(sensors.motion !== undefined ? sensors.motion : (body.motionDetected !== undefined ? body.motionDetected : false));
  const powerW = parseFloat(sensors.power_w !== undefined ? sensors.power_w : (body.powerW !== undefined ? body.powerW : (body.powerConsumedKwh ? body.powerConsumedKwh * 1000 : 0.0)));
  const currentAmps = parseFloat(sensors.current_a !== undefined ? sensors.current_a : (body.currentAmps !== undefined ? body.currentAmps : 0.0));
  const voltage = parseFloat(sensors.voltage !== undefined ? sensors.voltage : (body.voltage !== undefined ? body.voltage : 230.0));
  const internalTempCelsius = parseFloat(sensors.temp_c !== undefined ? sensors.temp_c : (body.internalTempCelsius !== undefined ? body.internalTempCelsius : 25.0));
  const lumenOutput = parseInt(sensors.lumens !== undefined ? sensors.lumens : (body.lumenOutput !== undefined ? body.lumenOutput : 0), 10);
  const powerConsumedKwh = parseFloat((powerW / 1000.0).toFixed(4));

  // 1. Verify Pole Existence in Master Asset Register
  let pole = await db.getOne(`SELECT * FROM poles WHERE id = $1 OR pole_code = $1`, [poleId]);
  if (!pole) {
    // If testing edge fixture not yet registered, auto-register to prevent data drop
    const newId = `pole-${poleId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    await db.query(
      `INSERT INTO poles (id, pole_code, location_name, zone, latitude, longitude, status, base_wattage, max_lumens, current_brightness)
       VALUES ($1, $2, $3, $4, 26.8920, 81.0601, 'ACTIVE', 150, 18000, 80)
       ON CONFLICT (id) DO NOTHING`,
      [newId, poleId, `Hierarchical Fixture ${poleId}`, zoneId]
    );
    pole = await db.getOne(`SELECT * FROM poles WHERE id = $1 OR pole_code = $1`, [newId]);
  }

  // 2. Closed-Loop AI Dimming Inference (Trained Ridge Model + Reactive Radar Surge)
  const now = new Date();
  const aiResult = aiInferenceService.computeDimming({
    ambientLux,
    motionDetected,
    hourOfDay: now.getHours(),
    dayOfWeek: now.getDay(),
    tempC: internalTempCelsius,
    zone: pole.zone,
  });

  const commandedBrightness = pole.status === 'FAULTY' ? 0 : aiResult.commandedBrightness;
  const effectiveLumens = lumenOutput > 0 ? lumenOutput : Math.round((pole.max_lumens * commandedBrightness) / 100);

  // 3. Hierarchical Anomaly Diagnostics (Zone -> Mini-Cluster -> Pole)
  const anomaly = await anomalyService.auditTelemetry({
    poleId: pole.id,
    miniClusterId,
    zoneId,
    currentBrightness: commandedBrightness,
    currentAmps,
    powerConsumedKwh,
    voltage,
    internalTempCelsius,
    lumenOutput: effectiveLumens,
  });

  // 4. Ingest Telemetry into TimescaleDB Hypertable
  await db.query(
    `INSERT INTO sensor_data (
      time, pole_id, ambient_light, motion_detected, vehicle_detected, 
      pedestrian_count, current_brightness, power_consumed_kwh, 
      voltage, current_amps, internal_temp_celsius, lumen_output
    ) VALUES (
      CURRENT_TIMESTAMP, $1, $2, $3, $4, 0, $5, $6, $7, $8, $9, $10
    )`,
    [
      pole.id,
      ambientLux,
      motionDetected,
      motionDetected,
      commandedBrightness,
      powerConsumedKwh,
      voltage,
      currentAmps,
      internalTempCelsius,
      effectiveLumens,
    ]
  );

  // 5. Update Real-Time Pole Dynamic State
  const nextStatus = pole.status === 'FAULTY' ? 'FAULTY' : (commandedBrightness === 0 ? 'OFFLINE' : (commandedBrightness <= 30 ? 'DIMMED' : 'ACTIVE'));

  await db.query(
    `UPDATE poles 
     SET current_brightness = $2, 
         motion_detected = $3, 
         status = $4, 
         last_heartbeat = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [pole.id, commandedBrightness, motionDetected, nextStatus]
  );

  // 6. Log Prediction Audit Record
  const predictionId = `pred-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  await db.query(
    `INSERT INTO ai_brightness_predictions (
      id, time, pole_id, predicted_brightness, actual_brightness, 
      ambient_lux, motion_state, hour_of_day, confidence_score
    ) VALUES (
      $1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6, $7, $8
    )`,
    [
      predictionId,
      pole.id,
      aiResult.proactiveBase || commandedBrightness,
      commandedBrightness,
      ambientLux,
      motionDetected,
      now.getHours(),
      aiResult.confidence,
    ]
  );

  res.status(201).json({
    success: true,
    message: 'Hierarchical edge telemetry ingested and processed.',
    hierarchy: {
      zoneId,
      miniClusterId,
      poleId: pole.pole_code,
    },
    control: {
      commandedBrightness,
      proactiveBase: aiResult.proactiveBase,
      predictedTrafficVolume: aiResult.predictedTrafficVolume,
      mode: aiResult.mode,
      inferenceTimeMs: aiResult.inferenceTimeMs,
      confidence: aiResult.confidence,
    },
    diagnostic: {
      status: nextStatus,
      powerW: (powerConsumedKwh * 1000).toFixed(1),
      currentA: currentAmps,
      anomalyDetected: !!anomaly,
      anomaly: anomaly || null,
    },
  });
});

/**
 * Get historical time-series telemetry for a pole
 * Endpoint: GET /api/telemetry/history/:poleId
 */
exports.getPoleTelemetryHistory = asyncHandler(async (req, res) => {
  const { poleId } = req.params;
  const { limit = 50 } = req.query;

  const rows = await db.getMany(
    `SELECT * FROM sensor_data 
     WHERE pole_id = (SELECT id FROM poles WHERE id = $1 OR pole_code = $1 LIMIT 1) 
     ORDER BY time DESC 
     LIMIT $2`,
    [poleId, parseInt(limit, 10)]
  );

  res.json({
    success: true,
    count: rows.length,
    data: rows,
  });
});
