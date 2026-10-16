-- ============================================================================
-- Intelligent Street Lighting System Using AI
-- Production Query Library (Used by Express Backend Controllers & Services)
-- ============================================================================

-- 1. POLE MAP & INVENTORY
-- Get all poles with their latest telemetry and alert count for dashboard map rendering
-- Name: GetDashboardPoles
SELECT 
    p.id,
    p.pole_code,
    p.location_name,
    p.zone,
    p.latitude,
    p.longitude,
    p.status,
    p.base_wattage,
    p.current_brightness,
    p.motion_detected,
    p.last_heartbeat,
    COALESCE(latest.ambient_light, 0.0) AS ambient_light,
    COALESCE(latest.power_consumed_kwh, 0.0) AS power_consumed_kwh,
    COALESCE(latest.internal_temp_celsius, 25.0) AS internal_temp,
    (SELECT COUNT(*) FROM fault_alerts fa WHERE fa.pole_id = p.id AND fa.resolved = FALSE) AS active_alerts
FROM poles p
LEFT JOIN LATERAL (
    SELECT ambient_light, power_consumed_kwh, internal_temp_celsius
    FROM sensor_data sd
    WHERE sd.pole_id = p.id
    ORDER BY sd.time DESC
    LIMIT 1
) latest ON TRUE
ORDER BY p.pole_code ASC;

-- 2. TELEMETRY INGESTION (With automatic pole status & heartbeat update)
-- Name: InsertSensorReading
INSERT INTO sensor_data (
    time, pole_id, ambient_light, motion_detected, vehicle_detected, 
    pedestrian_count, current_brightness, power_consumed_kwh, 
    voltage, current_amps, internal_temp_celsius, lumen_output
) VALUES (
    COALESCE($1, CURRENT_TIMESTAMP), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
);

-- Update pole dynamic states on every incoming sensor frame
-- Name: UpdatePoleTelemetryState
UPDATE poles
SET 
    current_brightness = $2,
    motion_detected = $3,
    status = CASE 
        WHEN status = 'FAULTY' THEN 'FAULTY'
        WHEN $2 = 0 THEN 'OFFLINE'
        WHEN $2 <= 30 THEN 'DIMMED'
        ELSE 'ACTIVE'
    END,
    last_heartbeat = CURRENT_TIMESTAMP
WHERE id = $1;

-- 3. AUTOMATED ANOMALY DETECTION QUERY
-- Checks for burnout / driver fault: requested brightness > 0 but current draw is 0.0A
-- Name: DetectZeroPowerAnomaly
SELECT 
    p.id AS pole_id,
    p.pole_code,
    p.location_name,
    sd.current_brightness,
    sd.current_amps,
    sd.power_consumed_kwh
FROM sensor_data sd
JOIN poles p ON p.id = sd.pole_id
WHERE sd.time >= NOW() - INTERVAL '5 minutes'
  AND sd.current_brightness > 20
  AND sd.current_amps < 0.05
  AND NOT EXISTS (
      SELECT 1 FROM fault_alerts fa 
      WHERE fa.pole_id = p.id 
        AND fa.fault_type = 'NO_POWER' 
        AND fa.resolved = FALSE
  );

-- 4. 24-HOUR ENERGY DASHBOARD CHART DATA
-- Returns baseline vs AI-optimized energy curve for Recharts frontend
-- Name: Get24HourEnergyComparison
SELECT 
    hour,
    ROUND(SUM(baseline_energy_kwh)::numeric, 3) AS baseline_kwh,
    ROUND(SUM(ai_optimized_energy_kwh)::numeric, 3) AS ai_optimized_kwh,
    ROUND(SUM(energy_saved_kwh)::numeric, 3) AS saved_kwh,
    ROUND(AVG(percentage_saved)::numeric, 1) AS savings_pct,
    ROUND(SUM(co2_avoided_kg)::numeric, 2) AS co2_saved_kg
FROM energy_benchmarks
WHERE record_date = CURRENT_DATE
GROUP BY hour
ORDER BY hour ASC;

-- 5. ACTIVE FAULT ALERTS LIST
-- Fetches recent unresolved alerts with technician contact info
-- Name: GetActiveAlerts
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
    fa.assigned_to,
    u.name AS technician_name,
    fa.resolved
FROM fault_alerts fa
JOIN poles p ON p.id = fa.pole_id
LEFT JOIN users u ON u.id = fa.assigned_to
WHERE fa.resolved = FALSE
ORDER BY 
    CASE fa.severity 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'WARNING' THEN 2 
        ELSE 3 
    END, 
    fa.timestamp DESC;

-- 6. RESOLVE AN ALERT
-- Name: ResolveFaultAlert
UPDATE fault_alerts
SET 
    resolved = TRUE,
    resolved_at = CURRENT_TIMESTAMP,
    resolution_notes = $2
WHERE id = $1;

-- 7. OVERALL KPI METRICS
-- Real-time aggregations for top dashboard counters
-- Name: GetSystemKPIs
SELECT 
    (SELECT COUNT(*) FROM poles) AS total_poles,
    (SELECT COUNT(*) FROM poles WHERE status = 'ACTIVE') AS active_poles,
    (SELECT COUNT(*) FROM poles WHERE status = 'DIMMED') AS dimmed_poles,
    (SELECT COUNT(*) FROM poles WHERE status = 'FAULTY') AS faulty_poles,
    (SELECT COUNT(*) FROM poles WHERE status = 'OFFLINE') AS offline_poles,
    (SELECT COUNT(*) FROM fault_alerts WHERE resolved = FALSE) AS total_active_alerts,
    (SELECT ROUND(SUM(energy_saved_kwh)::numeric, 2) FROM energy_benchmarks WHERE record_date = CURRENT_DATE) AS today_energy_saved_kwh,
    (SELECT ROUND(AVG(percentage_saved)::numeric, 1) FROM energy_benchmarks WHERE record_date = CURRENT_DATE) AS today_avg_savings_pct,
    (SELECT ROUND(SUM(co2_avoided_kg)::numeric, 2) FROM energy_benchmarks WHERE record_date = CURRENT_DATE) AS today_co2_offset_kg;
