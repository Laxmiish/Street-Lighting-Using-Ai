/**
 * LuminaAI — Maintenance & Field Work-Orders Controller
 * Manages municipal work orders, SLA countdowns, parts replacement,
 * and technician dispatches.
 */

const db = require('../../database/db');
const auditService = require('../services/auditService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all maintenance work orders
 * Endpoint: GET /api/maintenance
 */
exports.getWorkOrders = asyncHandler(async (req, res) => {
  const { status, priority, search } = req.query;

  let sql = `
    SELECT 
      mr.*,
      p.pole_code,
      p.location_name,
      p.zone
    FROM maintenance_records mr
    JOIN poles p ON p.id = mr.pole_id
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== 'ALL') {
    params.push(status);
    sql += ` AND mr.status = $${params.length}`;
  }

  if (priority && priority !== 'ALL') {
    params.push(priority);
    sql += ` AND mr.priority = $${params.length}`;
  }

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    sql += ` AND (
      LOWER(mr.work_order_id) LIKE $${params.length} OR 
      LOWER(p.pole_code) LIKE $${params.length} OR 
      LOWER(mr.category) LIKE $${params.length} OR 
      LOWER(mr.assigned_technician) LIKE $${params.length}
    )`;
  }

  sql += ` ORDER BY 
    CASE mr.priority 
      WHEN 'CRITICAL' THEN 1 
      WHEN 'HIGH' THEN 2 
      WHEN 'MEDIUM' THEN 3 
      ELSE 4 
    END ASC, 
    mr.created_at DESC;`;

  const rows = await db.getMany(sql, params);

  const formatted = rows.map(r => ({
    workOrderId: r.work_order_id,
    poleId: r.pole_id,
    poleCode: r.pole_code,
    locationName: r.location_name,
    zone: r.zone,
    category: r.category,
    priority: r.priority,
    status: r.status,
    assignedTechnician: r.assigned_technician,
    scheduledDate: r.scheduled_date,
    estimatedHours: parseFloat(r.estimated_hours),
    description: r.description,
    partsRequired: r.parts_required,
    slaDeadline: r.sla_deadline,
    completionNotes: r.completion_notes,
    completedAt: r.completed_at,
    createdAt: r.created_at,
  }));

  res.json({
    success: true,
    count: formatted.length,
    data: formatted,
  });
});

/**
 * Create a new maintenance work order
 * Endpoint: POST /api/maintenance
 */
exports.createWorkOrder = asyncHandler(async (req, res) => {
  const {
    poleId,
    poleCode,
    category,
    priority = 'HIGH',
    assignedTechnician = 'Field Operations — Rapid Response Unit',
    partsRequired = 'Standard Maintenance Kit',
    slaDeadline = 'Within 24 Hours',
    estimatedHours = 2.0,
    description,
  } = req.body;

  // Resolve pole identifier
  let targetPole = null;
  if (poleId) {
    targetPole = await db.getOne(`SELECT * FROM poles WHERE id = $1 OR pole_code = $1`, [poleId]);
  } else if (poleCode) {
    targetPole = await db.getOne(`SELECT * FROM poles WHERE pole_code = $1`, [poleCode]);
  }

  if (!targetPole) {
    return res.status(404).json({ success: false, message: 'Valid pole asset must be specified.' });
  }

  const id = `wo-uuid-${Date.now()}`;
  const workOrderId = `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const created = await db.getOne(
    `INSERT INTO maintenance_records (
      id, work_order_id, pole_id, category, priority, status,
      assigned_technician, scheduled_date, estimated_hours,
      description, parts_required, sla_deadline
    ) VALUES (
      $1, $2, $3, $4, $5, 'SCHEDULED', $6, CURRENT_DATE, $7, $8, $9, $10
    ) RETURNING *`,
    [
      id,
      workOrderId,
      targetPole.id,
      category,
      priority,
      assignedTechnician,
      estimatedHours,
      description || `Scheduled ${category} for asset ${targetPole.pole_code}.`,
      partsRequired,
      slaDeadline,
    ]
  );

  // Automatically record to immutable audit trail
  await auditService.logEvent({
    sector: targetPole.zone,
    eventType: 'Work Order Dispatched',
    summary: `Work order ${workOrderId} created for ${targetPole.pole_code}: ${category}.`,
    metric: `Priority: ${priority}`,
    compliance: 'SLA Initiated',
    loggedBy: 'Automated Operations Dispatcher',
    poleId: targetPole.id,
  });

  res.status(201).json({
    success: true,
    message: `Work order ${workOrderId} dispatched successfully.`,
    data: {
      ...created,
      poleCode: targetPole.pole_code,
      locationName: targetPole.locationName,
      zone: targetPole.zone,
    },
  });
});

/**
 * Update work order status (DISPATCHED, IN_PROGRESS, COMPLETED)
 * Endpoint: PUT /api/maintenance/:workOrderId/status
 */
exports.updateWorkOrderStatus = asyncHandler(async (req, res) => {
  const { workOrderId } = req.params;
  const { status, completionNotes } = req.body;

  if (!['SCHEDULED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be: SCHEDULED, DISPATCHED, IN_PROGRESS, COMPLETED, or CANCELLED.',
    });
  }

  const existing = await db.getOne(
    `SELECT mr.*, p.zone, p.pole_code FROM maintenance_records mr JOIN poles p ON p.id = mr.pole_id WHERE mr.work_order_id = $1`,
    [workOrderId]
  );

  if (!existing) {
    return res.status(404).json({ success: false, message: `Work order not found: ${workOrderId}` });
  }

  const isCompleted = status === 'COMPLETED';

  const updated = await db.getOne(
    `UPDATE maintenance_records 
     SET status = $2, 
         completion_notes = COALESCE($3, completion_notes),
         completed_at = CASE WHEN $2 = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE completed_at END,
         updated_at = CURRENT_TIMESTAMP
     WHERE work_order_id = $1
     RETURNING *`,
    [workOrderId, status, completionNotes || null]
  );

  // If marked COMPLETED, check if pole status should be restored from FAULTY to ACTIVE
  if (isCompleted) {
    await db.query(
      `UPDATE poles SET status = 'ACTIVE' WHERE id = $1 AND status = 'FAULTY'`,
      [existing.pole_id]
    );

    // Resolve any open fault alerts for this pole
    await db.query(
      `UPDATE fault_alerts 
       SET resolved = TRUE, resolved_at = CURRENT_TIMESTAMP, resolution_notes = $2
       WHERE pole_id = $1 AND resolved = FALSE`,
      [existing.pole_id, completionNotes || `Resolved via work order ${workOrderId}`]
    );
  }

  // Record audit log entry
  await auditService.logEvent({
    sector: existing.zone,
    eventType: 'Maintenance Status Update',
    summary: `Work order ${workOrderId} (${existing.category}) transitioned to ${status}.`,
    metric: `Status: ${status}`,
    compliance: isCompleted ? 'Resolved & Verified' : 'In Progress',
    loggedBy: 'Municipal Dispatch Console',
    poleId: existing.pole_id,
  });

  res.json({
    success: true,
    message: `Work order ${workOrderId} updated to ${status}.`,
    data: updated,
  });
});
