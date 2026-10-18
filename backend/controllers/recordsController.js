/**
 * LuminaAI — System Audit Register & Historical Telemetry Records Controller
 * Adheres to audit-log specifications for statutory compliance and data export.
 */

const auditService = require('../services/auditService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get audit records with multi-parameter filtering
 * Endpoint: GET /api/records
 */
exports.getRecords = asyncHandler(async (req, res) => {
  const { sector, eventType, search, limit = 100, offset = 0 } = req.query;

  const rows = await auditService.getAuditLogs({
    sector,
    eventType,
    search,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  });

  const formatted = rows.map(r => ({
    recordId: r.record_id,
    timestamp: r.timestamp,
    sector: r.sector,
    eventType: r.event_type,
    summary: r.summary,
    metric: r.metric,
    compliance: r.compliance,
    loggedBy: r.logged_by,
    poleId: r.pole_id,
    details: r.details_json,
  }));

  res.json({
    success: true,
    count: formatted.length,
    data: formatted,
  });
});

/**
 * Create a new audit record entry
 * Endpoint: POST /api/records
 */
exports.createRecord = asyncHandler(async (req, res) => {
  const { sector, eventType, summary, metric, compliance, loggedBy, poleId, detailsJson } = req.body;

  if (!summary) {
    return res.status(400).json({ success: false, message: 'summary is required.' });
  }

  const record = await auditService.logEvent({
    sector,
    eventType,
    summary,
    metric,
    compliance,
    loggedBy,
    poleId,
    detailsJson,
  });

  res.status(201).json({
    success: true,
    message: 'Audit record recorded in statutory ledger.',
    data: record,
  });
});

/**
 * Export audit records as a CSV stream
 * Endpoint: GET /api/records/export
 */
exports.exportCsv = asyncHandler(async (req, res) => {
  const { sector, eventType, search } = req.query;

  const rows = await auditService.getAuditLogs({
    sector,
    eventType,
    search,
    limit: 10000,
    offset: 0,
  });

  const headers = ['Record ID', 'Timestamp', 'Sector', 'Event Type', 'Operational Summary', 'Metric / Impact', 'Compliance Rating', 'Logged By'];
  const csvLines = [headers.join(',')];

  rows.forEach(r => {
    const escapedSummary = (r.summary || '').replace(/"/g, '""');
    csvLines.push([
      `"${r.record_id}"`,
      `"${r.timestamp}"`,
      `"${r.sector}"`,
      `"${r.event_type}"`,
      `"${escapedSummary}"`,
      `"${r.metric || ''}"`,
      `"${r.compliance || ''}"`,
      `"${r.logged_by || ''}"`,
    ].join(','));
  });

  const csvOutput = csvLines.join('\n');
  const filename = `LuminaAI_Municipal_Audit_Register_${new Date().toISOString().split('T')[0]}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csvOutput);
});
