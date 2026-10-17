/**
 * LuminaAI — Statutory Audit Trail Service
 * Adheres to audit-log specifications for immutable chronological ledger recording.
 */

const db = require('../../database/db');

class AuditService {
  /**
   * Log an event into the immutable system audit trail
   * @param {Object} entry
   * @param {string} entry.sector - Municipal corridor/precinct
   * @param {string} entry.eventType - Classification (e.g., 'AI Dynamic Shift', 'Daylight Transition')
   * @param {string} entry.summary - Operational human-readable explanation
   * @param {string} [entry.metric] - Telemetry delta/impact
   * @param {string} [entry.compliance='IRC:SP:72 Compliant'] - Standard verified
   * @param {string} [entry.loggedBy='Municipal Central System'] - Subsystem origin
   * @param {string} [entry.poleId=null] - Optional pole UUID
   * @param {Object} [entry.detailsJson=null] - Optional structured technical data
   * @returns {Promise<Object>} Created audit log entry
   */
  async logEvent({
    sector = 'All Metropolitan Sectors',
    eventType = 'System Event',
    summary,
    metric = 'N/A',
    compliance = 'IRC:SP:72 Compliant',
    loggedBy = 'Autonomous Municipal Controller',
    poleId = null,
    detailsJson = null,
  }) {
    const id = `rec-uuid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const recordId = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await db.query(
        `INSERT INTO system_audit_logs (
          id, record_id, timestamp, sector, event_type, summary, metric, compliance, logged_by, pole_id, details_json
        ) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          id,
          recordId,
          sector,
          eventType,
          summary,
          metric,
          compliance,
          loggedBy,
          poleId,
          detailsJson ? JSON.stringify(detailsJson) : null,
        ]
      );
      return res.rows[0];
    } catch (err) {
      console.error('[AUDIT LOG ERROR] Failed to record audit log:', err.message);
      return null;
    }
  }

  /**
   * Retrieve historical audit records with multi-parameter filtering
   */
  async getAuditLogs({ sector, eventType, search, limit = 100, offset = 0 } = {}) {
    let sql = `SELECT * FROM system_audit_logs WHERE 1=1`;
    const params = [];

    if (sector && sector !== 'ALL') {
      params.push(sector);
      sql += ` AND sector = $${params.length}`;
    }

    if (eventType && eventType !== 'ALL') {
      params.push(eventType);
      sql += ` AND event_type = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(summary) LIKE $${params.length} OR LOWER(record_id) LIKE $${params.length} OR LOWER(sector) LIKE $${params.length} OR LOWER(logged_by) LIKE $${params.length})`;
    }

    sql += ` ORDER BY timestamp DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const rows = await db.getMany(sql, params);
    return rows;
  }
}

module.exports = new AuditService();
