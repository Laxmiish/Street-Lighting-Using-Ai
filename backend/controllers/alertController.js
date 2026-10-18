/**
 * LuminaAI — Incident & Hardware Anomaly Alert Controller
 * Manages active dispatch alerts and operational incident resolution.
 */

const db = require('../../database/db');
const auditService = require('../services/auditService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get active (unresolved) and recently resolved incident alerts
 * Endpoint: GET /api/alerts
 */
exports.getAlerts = asyncHandler(async (req, res) => {
  const alerts = await db.getMany(`
    SELECT 
      fa.id,
      fa.pole_id,
      p.pole_code,
      p.location_name,
      p.zone,
      fa.timestamp,
      fa.fault_type,
      fa.severity,
      fa.description,
      fa.resolved,
      fa.resolved_at,
      fa.resolution_notes,
      COALESCE(u.name, 'Field Operations Unit') AS assigned_to
    FROM fault_alerts fa
    JOIN poles p ON p.id = fa.pole_id
    LEFT JOIN users u ON u.id = fa.assigned_to
    ORDER BY 
      fa.resolved ASC,
      CASE fa.severity 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'WARNING' THEN 2 
        ELSE 3 
      END ASC,
      fa.timestamp DESC;
  `);

  // Transform into clean user-facing operational presentation
  const formatted = alerts.map(a => {
    let faultCategory = 'Hardware Anomaly';
    let title = 'Operational Anomaly Detected';

    if (a.fault_type === 'NO_POWER' || a.fault_type === 'GRID_FAILURE') {
      faultCategory = 'No Power';
      title = 'Light Not Powering On';
    } else if (a.fault_type === 'BULB_BURNOUT') {
      faultCategory = 'Lamp Dark';
      title = 'Light Fixture Dark';
    } else if (a.fault_type === 'COMM_TIMEOUT') {
      faultCategory = 'Signal';
      title = 'Signal Check';
    } else if (a.fault_type === 'HIGH_TEMPERATURE') {
      faultCategory = 'Cooling';
      title = 'Self-Cooling Protection';
    } else if (a.fault_type === 'VOLTAGE_SURGE') {
      faultCategory = 'Voltage';
      title = 'Grid Voltage Check';
    }

    return {
      id: a.id,
      poleId: a.pole_id,
      poleCode: a.pole_code,
      locationName: a.location_name,
      zone: a.zone,
      faultType: a.fault_type,
      faultCategory,
      title,
      severity: a.severity,
      userFriendlySummary: a.description,
      timestamp: a.timestamp,
      assignedTo: a.assigned_to,
      resolved: a.resolved,
      resolvedAt: a.resolved_at,
      resolutionNotes: a.resolution_notes,
    };
  });

  res.json({
    success: true,
    count: formatted.length,
    data: formatted,
  });
});

/**
 * Resolve an active incident alert
 * Endpoint: PUT /api/alerts/:id/resolve
 */
exports.resolveAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes = 'Incident verified and resolved via municipal dispatch console.' } = req.body;

  const alert = await db.getOne(
    `SELECT fa.*, p.pole_code, p.zone FROM fault_alerts fa JOIN poles p ON p.id = fa.pole_id WHERE fa.id = $1`,
    [id]
  );

  if (!alert) {
    return res.status(404).json({ success: false, message: `Alert not found: ${id}` });
  }

  const updated = await db.getOne(
    `UPDATE fault_alerts 
     SET resolved = TRUE, resolved_at = CURRENT_TIMESTAMP, resolution_notes = $2
     WHERE id = $1
     RETURNING *`,
    [id, notes]
  );

  // If pole has no remaining active critical alerts, restore status if needed
  const remainingAlerts = await db.getOne(
    `SELECT COUNT(*) AS active_count FROM fault_alerts WHERE pole_id = $1 AND resolved = FALSE`,
    [alert.pole_id]
  );

  if (parseInt(remainingAlerts.active_count, 10) === 0) {
    await db.query(
      `UPDATE poles SET status = 'ACTIVE' WHERE id = $1 AND status = 'FAULTY'`,
      [alert.pole_id]
    );
  }

  // Log in statutory audit ledger
  await auditService.logEvent({
    sector: alert.zone,
    eventType: 'Incident Resolved',
    summary: `Incident ${id} for ${alert.pole_code} resolved. Notes: ${notes}`,
    metric: 'Resolved',
    compliance: 'SLA Met & Verified',
    loggedBy: 'Control Room Officer',
    poleId: alert.pole_id,
  });

  res.json({
    success: true,
    message: `Incident ${id} marked as resolved.`,
    data: updated,
  });
});
