-- ============================================================================
-- LuminaAI — Intelligent Municipal Adaptive Street Lighting Platform
-- Database Views & Continuous Aggregates (PostgreSQL + TimescaleDB)
-- Authority: Smart Cities Mission & Directorate of Urban Local Bodies
-- ============================================================================

-- 1. POLE HEALTH OVERVIEW VIEW
-- Joins street poles with their latest telemetry readings and active alert counts
CREATE OR REPLACE VIEW view_pole_health_overview AS
SELECT 
    p.id AS pole_id,
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
    COALESCE(latest_telemetry.ambient_light, 0.0) AS latest_ambient_lux,
    COALESCE(latest_telemetry.power_consumed_kwh, 0.0) AS latest_power_kwh,
    COALESCE(latest_telemetry.voltage, 230.0) AS latest_voltage,
    COALESCE(latest_telemetry.current_amps, 0.0) AS latest_current_amps,
    COALESCE(latest_telemetry.internal_temp_celsius, 25.0) AS latest_temp_celsius,
    COUNT(fa.id) FILTER (WHERE fa.resolved = FALSE) AS active_alerts_count,
    MAX(fa.severity) FILTER (WHERE fa.resolved = FALSE) AS max_active_severity
FROM poles p
LEFT JOIN LATERAL (
    SELECT 
        ambient_light, 
        power_consumed_kwh, 
        voltage, 
        current_amps, 
        internal_temp_celsius
    FROM sensor_data sd
    WHERE sd.pole_id = p.id
    ORDER BY sd.time DESC
    LIMIT 1
) latest_telemetry ON TRUE
LEFT JOIN fault_alerts fa ON fa.pole_id = p.id AND fa.resolved = FALSE
GROUP BY 
    p.id, p.pole_code, p.location_name, p.zone, p.latitude, p.longitude, 
    p.status, p.base_wattage, p.current_brightness, p.motion_detected, 
    p.last_heartbeat, latest_telemetry.ambient_light, latest_telemetry.power_consumed_kwh, 
    latest_telemetry.voltage, latest_telemetry.current_amps, latest_telemetry.internal_temp_celsius;

-- 2. HOURLY ZONE CONSUMPTION VIEW
-- Aggregates real-time power consumption by geographic zone per hour
CREATE OR REPLACE VIEW view_hourly_zone_consumption AS
SELECT 
    date_trunc('hour', sd.time) AS telemetry_hour,
    p.zone,
    COUNT(DISTINCT sd.pole_id) AS reporting_poles,
    ROUND(AVG(sd.ambient_light)::numeric, 2) AS avg_ambient_lux,
    ROUND(AVG(sd.current_brightness)::numeric, 1) AS avg_brightness_pct,
    ROUND(SUM(sd.power_consumed_kwh)::numeric, 4) AS total_power_kwh,
    COUNT(*) FILTER (WHERE sd.motion_detected = TRUE) AS motion_trigger_count
FROM sensor_data sd
JOIN poles p ON p.id = sd.pole_id
GROUP BY date_trunc('hour', sd.time), p.zone
ORDER BY telemetry_hour DESC, p.zone ASC;

-- 3. DAILY SAVINGS & ENVIRONMENTAL IMPACT SUMMARY VIEW
-- Evaluates real-time municipal cost and carbon offsets aligned with SDGs 7, 11, and 13
CREATE OR REPLACE VIEW view_daily_energy_savings_summary AS
SELECT 
    eb.record_date,
    COUNT(DISTINCT eb.pole_id) AS total_poles_measured,
    ROUND(SUM(eb.baseline_energy_kwh)::numeric, 3) AS total_baseline_kwh,
    ROUND(SUM(eb.ai_optimized_energy_kwh)::numeric, 3) AS total_actual_kwh,
    ROUND(SUM(eb.energy_saved_kwh)::numeric, 3) AS total_kwh_saved,
    ROUND((SUM(eb.energy_saved_kwh) / NULLIF(SUM(eb.baseline_energy_kwh), 0) * 100)::numeric, 2) AS overall_savings_percentage,
    ROUND(SUM(eb.co2_avoided_kg)::numeric, 2) AS total_co2_avoided_kg,
    -- Estimated electricity cost savings in INR (@ Rs 7.50 / kWh commercial municipal tariff)
    ROUND((SUM(eb.energy_saved_kwh) * 7.50)::numeric, 2) AS municipal_cost_saved_inr
FROM energy_benchmarks eb
GROUP BY eb.record_date
ORDER BY eb.record_date DESC;

-- 4. ACTIVE CRITICAL FAULT DISPATCH VIEW
-- High-priority queue for maintenance engineers showing fault age and technician assignment
CREATE OR REPLACE VIEW view_active_critical_faults AS
SELECT 
    fa.id AS alert_id,
    p.pole_code,
    p.location_name,
    p.zone,
    p.latitude,
    p.longitude,
    fa.timestamp AS detected_at,
    ROUND(EXTRACT(EPOCH FROM (NOW() - fa.timestamp)) / 3600::numeric, 1) AS fault_duration_hours,
    fa.fault_type,
    fa.severity,
    fa.description,
    u.name AS assigned_technician,
    u.phone AS technician_contact
FROM fault_alerts fa
JOIN poles p ON p.id = fa.pole_id
LEFT JOIN users u ON u.id = fa.assigned_to
WHERE fa.resolved = FALSE
ORDER BY 
    CASE fa.severity 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'WARNING' THEN 2 
        ELSE 3 
    END ASC, 
    fa.timestamp ASC;
