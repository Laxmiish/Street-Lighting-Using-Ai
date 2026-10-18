/**
 * LuminaAI — Pole Asset & Direct Control Controller
 * Manages street light fixture assets, manual brightness overrides,
 * simulated radar triggers, and sector-wide batch controls.
 */

const db = require('../../database/db');
const auditService = require('../services/auditService');
const aiInferenceService = require('../services/aiInferenceService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all street lighting poles with latest telemetry and alert count
 */
exports.getAllPoles = asyncHandler(async (req, res) => {
  const { zone, status, search } = req.query;

  let sql = `
    SELECT 
      p.id,
      p.pole_code,
      p.location_name,
      p.zone,
      p.latitude,
      p.longitude,
      p.status,
      p.base_wattage,
      p.max_lumens,
      p.current_brightness,
      p.motion_detected,
      p.mac_address,
      p.firmware_version,
      p.last_heartbeat,
      COALESCE(latest.ambient_light, 0.0) AS ambient_light,
      COALESCE(latest.power_consumed_kwh, 0.0) AS power_consumed_kwh,
      COALESCE(latest.voltage, 230.0) AS voltage,
      COALESCE(latest.current_amps, 0.0) AS current_amps,
      COALESCE(latest.internal_temp_celsius, 25.0) AS internal_temp_celsius,
      COALESCE(latest.lumen_output, 0) AS lumen_output,
      COUNT(fa.id) FILTER (WHERE fa.resolved = FALSE) AS active_alerts_count
    FROM poles p
    LEFT JOIN LATERAL (
      SELECT 
        ambient_light, power_consumed_kwh, voltage, current_amps, internal_temp_celsius, lumen_output
      FROM sensor_data sd
      WHERE sd.pole_id = p.id
      ORDER BY sd.time DESC
      LIMIT 1
    ) latest ON TRUE
    LEFT JOIN fault_alerts fa ON fa.pole_id = p.id AND fa.resolved = FALSE
    WHERE 1=1
  `;

  const params = [];

  if (zone && zone !== 'ALL') {
    params.push(zone);
    sql += ` AND p.zone = $${params.length}`;
  }

  if (status && status !== 'ALL') {
    params.push(status);
    sql += ` AND p.status = $${params.length}`;
  }

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    sql += ` AND (LOWER(p.pole_code) LIKE $${params.length} OR LOWER(p.location_name) LIKE $${params.length} OR LOWER(p.zone) LIKE $${params.length})`;
  }

  sql += `
    GROUP BY 
      p.id, p.pole_code, p.location_name, p.zone, p.latitude, p.longitude, 
      p.status, p.base_wattage, p.max_lumens, p.current_brightness, p.motion_detected, 
      p.mac_address, p.firmware_version, p.last_heartbeat,
      latest.ambient_light, latest.power_consumed_kwh, latest.voltage, 
      latest.current_amps, latest.internal_temp_celsius, latest.lumen_output
    ORDER BY p.pole_code ASC;
  `;

  const rows = await db.getMany(sql, params);

  // Format into clean API schema matching frontend state
  const formatted = rows.map(r => ({
    id: r.id,
    poleCode: r.pole_code,
    locationName: r.location_name,
    zone: r.zone,
    latitude: parseFloat(r.latitude),
    longitude: parseFloat(r.longitude),
    status: r.status,
    baseWattage: r.base_wattage,
    maxLumens: r.max_lumens,
    currentBrightness: r.current_brightness,
    motionDetected: r.motion_detected,
    ambientLight: parseFloat(r.ambient_light),
    powerConsumedKwh: parseFloat(r.power_consumed_kwh),
    voltage: parseFloat(r.voltage),
    currentAmps: parseFloat(r.current_amps),
    internalTempCelsius: parseFloat(r.internal_temp_celsius),
    lumenOutput: r.lumen_output,
    activeAlertsCount: parseInt(r.active_alerts_count, 10),
    lastHeartbeat: r.last_heartbeat,
  }));

  res.json({
    success: true,
    count: formatted.length,
    data: formatted,
  });
});

/**
 * Get single pole details by ID
 */
exports.getPoleById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pole = await db.getOne(
    `SELECT * FROM poles WHERE id = $1 OR pole_code = $1`,
    [id]
  );

  if (!pole) {
    return res.status(404).json({
      success: false,
      message: `Street lighting asset not found: ${id}`,
    });
  }

  // Fetch recent 10 telemetry events
  const telemetry = await db.getMany(
    `SELECT * FROM sensor_data WHERE pole_id = $1 ORDER BY time DESC LIMIT 10`,
    [pole.id]
  );

  // Fetch active alerts
  const alerts = await db.getMany(
    `SELECT * FROM fault_alerts WHERE pole_id = $1 AND resolved = FALSE ORDER BY timestamp DESC`,
    [pole.id]
  );

  res.json({
    success: true,
    data: {
      ...pole,
      recentTelemetry: telemetry,
      activeAlerts: alerts,
    },
  });
});

/**
 * Update single pole brightness (Manual Override)
 */
exports.updateBrightness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { brightness } = req.body;

  const pole = await db.getOne(`SELECT * FROM poles WHERE id = $1 OR pole_code = $1`, [id]);
  if (!pole) {
    return res.status(404).json({ success: false, message: `Pole not found: ${id}` });
  }

  let newStatus = pole.status;
  if (newStatus !== 'FAULTY') {
    if (brightness === 0) newStatus = 'OFFLINE';
    else if (brightness <= 30) newStatus = 'DIMMED';
    else newStatus = 'ACTIVE';
  }

  // Recalculate immediate electrical parameters
  const wattageRatio = brightness / 100;
  const powerConsumedKwh = parseFloat(((pole.base_wattage * wattageRatio) / 1000).toFixed(3));
  const currentAmps = parseFloat(((powerConsumedKwh * 1000) / 230.0).toFixed(2));
  const lumenOutput = Math.round(pole.max_lumens * wattageRatio);

  await db.query(
    `UPDATE poles 
     SET current_brightness = $2, status = $3, last_heartbeat = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [pole.id, brightness, newStatus]
  );

  // Record audit log entry
  await auditService.logEvent({
    sector: pole.zone,
    eventType: 'Manual Brightness Override',
    summary: `Operator commanded ${pole.pole_code} to ${brightness}% brightness level.`,
    metric: `${brightness}% (${powerConsumedKwh} kW)`,
    compliance: 'Municipal Command Executed',
    loggedBy: 'Central Operations Console',
    poleId: pole.id,
  });

  res.json({
    success: true,
    message: `Illumination updated for ${pole.pole_code}`,
    data: {
      poleId: pole.id,
      poleCode: pole.pole_code,
      brightness,
      status: newStatus,
      powerConsumedKwh,
      currentAmps,
      lumenOutput,
    },
  });
});

/**
 * Trigger or toggle motion on single pole (Radar Simulation)
 */
exports.toggleMotion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pole = await db.getOne(`SELECT * FROM poles WHERE id = $1 OR pole_code = $1`, [id]);
  if (!pole) {
    return res.status(404).json({ success: false, message: `Pole not found: ${id}` });
  }

  const nextMotion = !pole.motion_detected;

  // Run AI inference to determine new brightness under this motion state
  const aiResult = aiInferenceService.computeDimming({
    ambientLux: 0.0,
    motionDetected: nextMotion,
    zone: pole.zone,
  });

  const newBrightness = pole.status === 'FAULTY' ? 0 : aiResult.commandedBrightness;
  const newStatus = pole.status === 'FAULTY' ? 'FAULTY' : (newBrightness <= 30 ? 'DIMMED' : 'ACTIVE');

  await db.query(
    `UPDATE poles 
     SET motion_detected = $2, current_brightness = $3, status = $4, last_heartbeat = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [pole.id, nextMotion, newBrightness, newStatus]
  );

  if (nextMotion) {
    await auditService.logEvent({
      sector: pole.zone,
      eventType: 'Radar Motion Trigger',
      summary: `Radar sensor triggered on ${pole.pole_code}. Illumination boosted to ${newBrightness}%.`,
      metric: `${newBrightness}% (${aiResult.mode})`,
      compliance: 'Road Safety Verified (IRC:SP:72)',
      loggedBy: 'Edge Doppler Radar Array',
      poleId: pole.id,
    });
  }

  res.json({
    success: true,
    data: {
      poleId: pole.id,
      poleCode: pole.pole_code,
      motionDetected: nextMotion,
      currentBrightness: newBrightness,
      status: newStatus,
      aiMode: aiResult.mode,
    },
  });
});

/**
 * Batch update brightness across an entire corridor/zone
 */
exports.batchBrightness = asyncHandler(async (req, res) => {
  const { zone, brightness } = req.body;

  if (!zone || brightness === undefined) {
    return res.status(400).json({ success: false, message: 'zone and brightness are required.' });
  }

  const newStatus = brightness === 0 ? 'OFFLINE' : (brightness <= 30 ? 'DIMMED' : 'ACTIVE');

  const result = await db.query(
    `UPDATE poles 
     SET current_brightness = $2, 
         status = CASE WHEN status = 'FAULTY' THEN 'FAULTY' ELSE $3 END,
         last_heartbeat = CURRENT_TIMESTAMP
     WHERE zone = $1
     RETURNING id, pole_code`,
    [zone, brightness, newStatus]
  );

  await auditService.logEvent({
    sector: zone,
    eventType: 'Corridor Batch Override',
    summary: `Batch command applied to all ${result.rowCount} fixtures in ${zone} to ${brightness}%.`,
    metric: `${brightness}% Sector Brightness`,
    compliance: 'Municipal Grid Command',
    loggedBy: 'Sector Dispatch Console',
  });

  res.json({
    success: true,
    message: `Batch brightness updated for ${result.rowCount} poles in ${zone}`,
    updatedCount: result.rowCount,
  });
});

/**
 * Batch toggle motion detection across an entire corridor/zone
 */
exports.batchMotion = asyncHandler(async (req, res) => {
  const { zone } = req.body;

  if (!zone) {
    return res.status(400).json({ success: false, message: 'zone is required.' });
  }

  // Check current motion status in zone
  const check = await db.getOne(
    `SELECT BOOL_OR(motion_detected) AS any_active FROM poles WHERE zone = $1`,
    [zone]
  );

  const nextMotion = !check.any_active;

  const aiResult = aiInferenceService.computeDimming({
    ambientLux: 0.0,
    motionDetected: nextMotion,
    zone,
  });

  const newBrightness = aiResult.commandedBrightness;
  const newStatus = newBrightness <= 30 ? 'DIMMED' : 'ACTIVE';

  const result = await db.query(
    `UPDATE poles 
     SET motion_detected = $2,
         current_brightness = CASE WHEN status = 'FAULTY' THEN 0 ELSE $3 END,
         status = CASE WHEN status = 'FAULTY' THEN 'FAULTY' ELSE $4 END,
         last_heartbeat = CURRENT_TIMESTAMP
     WHERE zone = $1
     RETURNING id`,
    [zone, nextMotion, newBrightness, newStatus]
  );

  await auditService.logEvent({
    sector: zone,
    eventType: 'Sector Radar Wave Trigger',
    summary: `Simulated radar wave across ${zone}. Motion set to ${nextMotion}. Commanded ${newBrightness}%.`,
    metric: `${newBrightness}% (${aiResult.mode})`,
    compliance: 'IRC:SP:72 Verified',
    loggedBy: 'Metropolitan Ingress Radar Gateway',
  });

  res.json({
    success: true,
    message: `Sector motion updated for ${result.rowCount} poles in ${zone}`,
    motionDetected: nextMotion,
    brightness: newBrightness,
    updatedCount: result.rowCount,
  });
});
