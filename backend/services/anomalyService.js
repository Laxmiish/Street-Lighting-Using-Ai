/**
 * LuminaAI — Hierarchical Anomaly & Diagnostic Service
 * Implements Section 1.B & 3 of ai_config.md:
 * 1. Single Pole Anomaly: LED Driver / Bulb Failure at individual fixture
 * 2. Mini-Cluster Anomaly: Transformer Blowout / Grid Feeder drop at street segment
 * 3. Thermal & Overvoltage Circuit Safeguards
 */

const db = require('../../database/db');

class AnomalyService {
  /**
   * Audit incoming telemetry packet across the 3-tier hierarchy (Zone -> Mini-Cluster -> Pole)
   * @param {Object} telemetry
   * @param {string} telemetry.poleId - Pole UUID or tag (e.g., PL-042, SL-METRO-006)
   * @param {string} [telemetry.miniClusterId] - Mini-cluster identifier (e.g., MC-NORTH-BOUND-A)
   * @param {string} [telemetry.zoneId] - Zone gateway identifier (e.g., ZONE-GATEWAY-01)
   * @param {number} telemetry.currentBrightness - Commanded brightness (0-100)
   * @param {number} telemetry.currentAmps - AC current draw (Amperes)
   * @param {number} telemetry.powerConsumedKwh - Real-time electricity consumed
   * @param {number} telemetry.voltage - AC voltage (Volts)
   * @param {number} telemetry.internalTempCelsius - Heat sink temperature
   * @param {number} telemetry.lumenOutput - Optical photodiode output
   * @returns {Promise<Object|null>} Diagnostic incident object or null if healthy
   */
  async auditTelemetry(telemetry) {
    const {
      poleId,
      miniClusterId = 'MC-SECTOR-01',
      zoneId = 'ZONE-GATEWAY-01',
      currentBrightness = 0,
      currentAmps = 0.0,
      powerConsumedKwh = 0.0,
      voltage = 230.0,
      internalTempCelsius = 25.0,
      lumenOutput = 0,
    } = telemetry;

    let faultType = null;
    let severity = 'WARNING';
    let title = null;
    let userFriendlySummary = null;
    let hierarchyLevel = 'POLE';

    // 1. Mini-Cluster Level Check (Grid Power Cut or Transformer Blowout)
    // Check if other poles in this mini-cluster are also reporting zero voltage or zero current
    if (currentBrightness >= 30 && currentAmps < 0.05) {
      try {
        const clusterPoles = await db.getMany(
          `SELECT p.id, sd.current_amps 
           FROM poles p
           LEFT JOIN LATERAL (
             SELECT current_amps FROM sensor_data 
             WHERE pole_id = p.id 
             ORDER BY time DESC LIMIT 1
           ) sd ON TRUE
           WHERE p.zone = (SELECT zone FROM poles WHERE id = $1 OR pole_code = $1 LIMIT 1)
             AND p.id != $1
           LIMIT 5`,
          [poleId]
        );

        const allZeroInCluster = clusterPoles.length >= 2 && clusterPoles.every(p => parseFloat(p.current_amps || 0) < 0.05);

        if (allZeroInCluster) {
          // Mini-Cluster / Street Segment Wide Grid Cut
          faultType = 'GRID_FAILURE';
          severity = 'CRITICAL';
          hierarchyLevel = 'MINI_CLUSTER';
          title = `Street Power Outage (${miniClusterId})`;
          userFriendlySummary = `Power outage detected across street segment ${miniClusterId}. Service crew dispatched to inspect feeder.`;
        } else {
          // Single Pole LED Driver Failure
          faultType = 'NO_POWER';
          severity = 'CRITICAL';
          hierarchyLevel = 'POLE';
          title = `Light Not Powering On (${poleId})`;
          userFriendlySummary = `Light fixture ${poleId} is off. Field technician assigned for inspection.`;
        }
      } catch (err) {
        faultType = 'NO_POWER';
        severity = 'CRITICAL';
        title = `Light Not Powering On (${poleId})`;
        userFriendlySummary = `Light fixture ${poleId} is off. Field technician assigned for inspection.`;
      }
    }
    // 2. Optical Luminaire Failure (Burnt Diode Array)
    else if (currentBrightness >= 50 && powerConsumedKwh > 0.03 && lumenOutput === 0) {
      faultType = 'BULB_BURNOUT';
      severity = 'CRITICAL';
      hierarchyLevel = 'POLE';
      title = `Light Fixture Dark (${poleId})`;
      userFriendlySummary = `Light fixture ${poleId} is dark. Replacement luminaire module scheduled.`;
    }
    // 3. Thermal Overload Protection
    else if (internalTempCelsius >= 75.0) {
      faultType = 'HIGH_TEMPERATURE';
      severity = 'WARNING';
      hierarchyLevel = 'POLE';
      title = `Self-Cooling Protection (${poleId})`;
      userFriendlySummary = `Light fixture ${poleId} dimmed automatically to cool down safely.`;
    }
    // 4. AC Grid Voltage Surge or Sag
    else if (voltage < 185.0 || voltage > 265.0) {
      faultType = 'VOLTAGE_SURGE';
      severity = 'WARNING';
      hierarchyLevel = 'MINI_CLUSTER';
      title = `Grid Voltage Check (${miniClusterId})`;
      userFriendlySummary = `Grid power fluctuation detected on feeder ${miniClusterId}. Surge safeguard active.`;
    }

    if (!faultType) {
      return null;
    }

    // Check for existing unresolved alert
    try {
      const existing = await db.getOne(
        `SELECT id FROM fault_alerts 
         WHERE pole_id = (SELECT id FROM poles WHERE id = $1 OR pole_code = $1 LIMIT 1)
           AND fault_type = $2 
           AND resolved = FALSE 
         LIMIT 1`,
        [poleId, faultType]
      );

      if (existing) {
        return {
          id: existing.id,
          isNew: false,
          faultType,
          severity,
          hierarchyLevel,
          title,
          userFriendlySummary,
        };
      }

      // Insert new incident ticket
      const alertId = `alert-${Date.now().toString().slice(-4)}`;
      const targetPole = await db.getOne(`SELECT id FROM poles WHERE id = $1 OR pole_code = $1 LIMIT 1`, [poleId]);
      const targetPoleId = targetPole ? targetPole.id : poleId;

      await db.query(
        `INSERT INTO fault_alerts (id, pole_id, timestamp, fault_type, severity, description, resolved)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, FALSE)`,
        [alertId, targetPoleId, faultType, severity, userFriendlySummary]
      );

      // Flag pole status as FAULTY if critical
      if (severity === 'CRITICAL') {
        await db.query(`UPDATE poles SET status = 'FAULTY' WHERE id = $1`, [targetPoleId]);
      }

      return {
        id: alertId,
        isNew: true,
        faultType,
        severity,
        hierarchyLevel,
        title,
        userFriendlySummary,
      };
    } catch (err) {
      console.error('[ANOMALY SERVICE ERROR]', err.message);
      return {
        faultType,
        severity,
        hierarchyLevel,
        title,
        userFriendlySummary,
      };
    }
  }
}

module.exports = new AnomalyService();
