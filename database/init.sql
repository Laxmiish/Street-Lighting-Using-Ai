-- ============================================================================
-- LuminaAI — Intelligent Municipal Adaptive Street Lighting Management Platform
-- Database Master Initialization (Schema + Seeds)
-- Authority: Smart Cities Mission & Directorate of Urban Local Bodies
-- ============================================================================

-- 0. EXTENSIONS SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
    RAISE NOTICE 'TimescaleDB extension enabled.';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TimescaleDB extension not available. Proceeding with standard PostgreSQL partitioned tables.';
END $$;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'technician')),
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. STREET LIGHT POLES TABLE
CREATE TABLE IF NOT EXISTS poles (
    id VARCHAR(36) PRIMARY KEY,
    pole_code VARCHAR(30) UNIQUE NOT NULL,
    location_name VARCHAR(150) NOT NULL,
    zone VARCHAR(50) NOT NULL DEFAULT 'Gateway Corridor',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DIMMED', 'FAULTY', 'OFFLINE')),
    base_wattage INT NOT NULL DEFAULT 150 CHECK (base_wattage > 0),
    max_lumens INT NOT NULL DEFAULT 18000,
    current_brightness INT NOT NULL DEFAULT 100 CHECK (current_brightness >= 0 AND current_brightness <= 100),
    motion_detected BOOLEAN NOT NULL DEFAULT FALSE,
    mac_address VARCHAR(30),
    firmware_version VARCHAR(20) DEFAULT 'v2.4.2-lora',
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. SENSOR TELEMETRY TABLE (Hypertable for Time-Series Data)
CREATE TABLE IF NOT EXISTS sensor_data (
    time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pole_id VARCHAR(36) NOT NULL REFERENCES poles(id) ON DELETE CASCADE,
    ambient_light DOUBLE PRECISION NOT NULL CHECK (ambient_light >= 0),
    motion_detected BOOLEAN NOT NULL DEFAULT FALSE,
    vehicle_detected BOOLEAN NOT NULL DEFAULT FALSE,
    pedestrian_count INT NOT NULL DEFAULT 0,
    current_brightness INT NOT NULL CHECK (current_brightness >= 0 AND current_brightness <= 100),
    power_consumed_kwh DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    voltage DOUBLE PRECISION NOT NULL DEFAULT 230.0,
    current_amps DOUBLE PRECISION NOT NULL DEFAULT 0.65,
    internal_temp_celsius DOUBLE PRECISION DEFAULT 28.5,
    lumen_output INT NOT NULL DEFAULT 0,
    PRIMARY KEY (time, pole_id)
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
        PERFORM create_hypertable('sensor_data', 'time', chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);
        RAISE NOTICE 'sensor_data converted to TimescaleDB hypertable.';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Hypertable conversion skipped.';
END $$;

-- 4. FAULT & ANOMALY ALERTS TABLE
CREATE TABLE IF NOT EXISTS fault_alerts (
    id VARCHAR(36) PRIMARY KEY,
    pole_id VARCHAR(36) NOT NULL REFERENCES poles(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fault_type VARCHAR(50) NOT NULL CHECK (fault_type IN ('NO_POWER', 'SENSOR_FAIL', 'HIGH_TEMPERATURE', 'COMM_TIMEOUT', 'BULB_BURNOUT', 'VOLTAGE_SURGE')),
    severity VARCHAR(20) NOT NULL DEFAULT 'WARNING' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    description TEXT NOT NULL,
    assigned_to VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT
);

-- 5. AI BRIGHTNESS PREDICTIONS LOG TABLE
CREATE TABLE IF NOT EXISTS ai_brightness_predictions (
    id VARCHAR(36) PRIMARY KEY,
    time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pole_id VARCHAR(36) NOT NULL REFERENCES poles(id) ON DELETE CASCADE,
    predicted_brightness INT NOT NULL CHECK (predicted_brightness >= 0 AND predicted_brightness <= 100),
    actual_brightness INT NOT NULL CHECK (actual_brightness >= 0 AND actual_brightness <= 100),
    ambient_lux DOUBLE PRECISION NOT NULL,
    motion_state BOOLEAN NOT NULL,
    hour_of_day INT NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.95
);

-- 6. ENERGY BENCHMARKS & SAVINGS ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS energy_benchmarks (
    id VARCHAR(36) PRIMARY KEY,
    record_date DATE NOT NULL,
    hour INT NOT NULL CHECK (hour >= 0 AND hour <= 23),
    pole_id VARCHAR(36) REFERENCES poles(id) ON DELETE CASCADE,
    baseline_energy_kwh DOUBLE PRECISION NOT NULL,
    ai_optimized_energy_kwh DOUBLE PRECISION NOT NULL,
    energy_saved_kwh DOUBLE PRECISION NOT NULL,
    percentage_saved DOUBLE PRECISION NOT NULL,
    co2_avoided_kg DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_pole_hourly_benchmark UNIQUE (record_date, hour, pole_id)
);

-- 7. MAINTENANCE & WORK-ORDERS REGISTER TABLE
CREATE TABLE IF NOT EXISTS maintenance_records (
    id VARCHAR(36) PRIMARY KEY,
    work_order_id VARCHAR(30) UNIQUE NOT NULL,
    pole_id VARCHAR(36) NOT NULL REFERENCES poles(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'HIGH' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    assigned_technician VARCHAR(150) NOT NULL,
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    estimated_hours DOUBLE PRECISION DEFAULT 2.0,
    description TEXT NOT NULL,
    parts_required VARCHAR(255),
    sla_deadline VARCHAR(50) DEFAULT 'Within 24 Hours',
    completion_notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. SYSTEM AUDIT & TELEMETRY EVENT LOGS TABLE
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    record_id VARCHAR(30) UNIQUE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sector VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    metric VARCHAR(100),
    compliance VARCHAR(100) DEFAULT 'IRC:SP:72 Compliant',
    logged_by VARCHAR(100) NOT NULL,
    pole_id VARCHAR(36) REFERENCES poles(id) ON DELETE SET NULL,
    details_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_poles_status ON poles(status);
CREATE INDEX IF NOT EXISTS idx_poles_zone ON poles(zone);
CREATE INDEX IF NOT EXISTS idx_poles_coords ON poles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_sensor_data_pole_time ON sensor_data(pole_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_data_time_desc ON sensor_data(time DESC);
CREATE INDEX IF NOT EXISTS idx_fault_alerts_resolved ON fault_alerts(resolved, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fault_alerts_pole ON fault_alerts(pole_id);
CREATE INDEX IF NOT EXISTS idx_energy_benchmarks_date_hour ON energy_benchmarks(record_date DESC, hour ASC);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance_records(priority);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON system_audit_logs(timestamp DESC);

-- ============================================================================
-- SEED DATA (Official Municipal Infrastructure)
-- ============================================================================

INSERT INTO users (id, name, email, password_hash, role, phone, is_active)
VALUES 
    ('u-001', 'Chief Systems Engineer', 'director.operations@smartcity.gov', '$2a$10$wE9vWp8e6lE9KqY0.xGgeOF7kZcE7i7Zq7v7k7g9eZq7v7k7g9eZq', 'admin', '+91 98765 43210', TRUE),
    ('u-002', 'Control Room Lead Officer', 'control.lead@smartcity.gov', '$2a$10$wE9vWp8e6lE9KqY0.xGgeOF7kZcE7i7Zq7v7k7g9eZq7v7k7g9eZq', 'admin', '+91 98765 43211', TRUE),
    ('u-003', 'Dispatch Operations Unit', 'operator.dispatch@smartcity.gov', '$2a$10$wE9vWp8e6lE9KqY0.xGgeOF7kZcE7i7Zq7v7k7g9eZq7v7k7g9eZq', 'operator', '+91 98765 43212', TRUE),
    ('u-004', 'Field Maintenance Specialist', 'technician.field@smartcity.gov', '$2a$10$wE9vWp8e6lE9KqY0.xGgeOF7kZcE7i7Zq7v7k7g9eZq7v7k7g9eZq', 'technician', '+91 98765 43213', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO poles (id, pole_code, location_name, zone, latitude, longitude, status, base_wattage, max_lumens, current_brightness, motion_detected, mac_address)
VALUES
    ('pole-01', 'SL-METRO-001', 'Metropolitan Ingress — North Gate 1', 'Gateway Corridor', 26.8920, 81.0601, 'ACTIVE', 150, 18000, 80, TRUE, '24:6F:28:AB:01:01'),
    ('pole-02', 'SL-METRO-002', 'Transit Interchange Security Checkpoint', 'Gateway Corridor', 26.8924, 81.0604, 'ACTIVE', 150, 18000, 75, TRUE, '24:6F:28:AB:01:02'),
    ('pole-03', 'SL-METRO-003', 'Civic Centre Boulevard East', 'Civic Centre Zone', 26.8929, 81.0612, 'ACTIVE', 120, 14000, 50, FALSE, '24:6F:28:AB:01:03'),
    ('pole-04', 'SL-METRO-004', 'Central Financial Plaza Avenue', 'Civic Centre Zone', 26.8934, 81.0618, 'ACTIVE', 150, 18000, 60, FALSE, '24:6F:28:AB:01:04'),
    ('pole-05', 'SL-METRO-005', 'Tech Park Promenade Walkway', 'Innovation Corridor', 26.8938, 81.0625, 'DIMMED', 120, 14000, 20, FALSE, '24:6F:28:AB:01:05'),
    ('pole-06', 'SL-METRO-006', 'Metropolitan Stadium Ring Road', 'Sports & Arena District', 26.8912, 81.0585, 'FAULTY', 150, 18000, 0, FALSE, '24:6F:28:AB:01:06'),
    ('pole-07', 'SL-METRO-007', 'Residential Sector 12 Access Road', 'Residential Sector', 26.8905, 81.0578, 'ACTIVE', 100, 12000, 30, FALSE, '24:6F:28:AB:01:07'),
    ('pole-08', 'SL-METRO-008', 'Residential Sector 14 Connector', 'Residential Sector', 26.8900, 81.0572, 'OFFLINE', 100, 12000, 0, FALSE, '24:6F:28:AB:01:08'),
    ('pole-09', 'SL-METRO-009', 'Arterial Expressway Junction North', 'Expressway Corridor', 26.8945, 81.0635, 'ACTIVE', 200, 24000, 100, TRUE, '24:6F:28:AB:01:09'),
    ('pole-10', 'SL-METRO-010', 'Arterial Expressway Median 1', 'Expressway Corridor', 26.8951, 81.0642, 'ACTIVE', 200, 24000, 90, TRUE, '24:6F:28:AB:01:10'),
    ('pole-11', 'SL-METRO-011', 'Arterial Expressway Median 2', 'Expressway Corridor', 26.8958, 81.0650, 'FAULTY', 200, 24000, 0, FALSE, '24:6F:28:AB:01:11'),
    ('pole-12', 'SL-METRO-012', 'Public Transit Logistics & Depot Loop', 'Logistics Zone', 26.8895, 81.0560, 'DIMMED', 120, 14000, 20, FALSE, '24:6F:28:AB:01:12')
ON CONFLICT (id) DO NOTHING;

INSERT INTO fault_alerts (id, pole_id, timestamp, fault_type, severity, description, assigned_to, resolved)
VALUES
    ('alert-001', 'pole-06', NOW() - INTERVAL '3 hours', 'NO_POWER', 'CRITICAL', 'Zero current draw detected (0.00A) while AI controller requested 80% brightness.', 'u-004', FALSE),
    ('alert-002', 'pole-08', NOW() - INTERVAL '6 hours', 'COMM_TIMEOUT', 'WARNING', 'Cellular edge node heartbeat timeout >45m.', 'u-004', FALSE),
    ('alert-003', 'pole-11', NOW() - INTERVAL '1 hour', 'BULB_BURNOUT', 'CRITICAL', 'Lumen sensor reads 0 lumens despite rated 200W electrical consumption.', NULL, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO energy_benchmarks (id, record_date, hour, pole_id, baseline_energy_kwh, ai_optimized_energy_kwh, energy_saved_kwh, percentage_saved, co2_avoided_kg)
VALUES
    ('bm-00', CURRENT_DATE, 0,  'pole-01', 0.150, 0.030, 0.120, 80.00, 0.098),
    ('bm-01', CURRENT_DATE, 1,  'pole-01', 0.150, 0.030, 0.120, 80.00, 0.098),
    ('bm-02', CURRENT_DATE, 2,  'pole-01', 0.150, 0.045, 0.105, 70.00, 0.086),
    ('bm-03', CURRENT_DATE, 3,  'pole-01', 0.150, 0.030, 0.120, 80.00, 0.098),
    ('bm-04', CURRENT_DATE, 4,  'pole-01', 0.150, 0.030, 0.120, 80.00, 0.098),
    ('bm-05', CURRENT_DATE, 5,  'pole-01', 0.150, 0.075, 0.075, 50.00, 0.061),
    ('bm-06', CURRENT_DATE, 6,  'pole-01', 0.150, 0.015, 0.135, 90.00, 0.111),
    ('bm-18', CURRENT_DATE, 18, 'pole-01', 0.150, 0.105, 0.045, 30.00, 0.037),
    ('bm-19', CURRENT_DATE, 19, 'pole-01', 0.150, 0.135, 0.015, 10.00, 0.012),
    ('bm-20', CURRENT_DATE, 20, 'pole-01', 0.150, 0.135, 0.015, 10.00, 0.012),
    ('bm-21', CURRENT_DATE, 21, 'pole-01', 0.150, 0.120, 0.030, 20.00, 0.025),
    ('bm-22', CURRENT_DATE, 22, 'pole-01', 0.150, 0.090, 0.060, 40.00, 0.049),
    ('bm-23', CURRENT_DATE, 23, 'pole-01', 0.150, 0.045, 0.105, 70.00, 0.086)
ON CONFLICT (record_date, hour, pole_id) DO NOTHING;

INSERT INTO maintenance_records (id, work_order_id, pole_id, category, priority, status, assigned_technician, scheduled_date, estimated_hours, description, parts_required, sla_deadline, completion_notes)
VALUES
    ('mr-01', 'WO-2026-1042', 'pole-06', 'LED Driver Replacement', 'HIGH', 'DISPATCHED', 'Unit 4 (Lead Specialist)', CURRENT_DATE, 2.5, 'Replace solid-state driver unit and verify ground current stability.', '150W Constant-Current LED Driver (IP67)', 'Within 24 Hours', NULL),
    ('mr-02', 'WO-2026-1043', 'pole-11', 'Luminaire Module Swap', 'CRITICAL', 'IN_PROGRESS', 'Expressway Rapid Response', CURRENT_DATE, 1.5, 'Replace optical diode array and inspect optical sensor receiver.', '200W High-Mast LED Cluster Module', 'Within 12 Hours', NULL),
    ('mr-03', 'WO-2026-1039', 'pole-08', 'Gateway Telemetry Check', 'MEDIUM', 'SCHEDULED', 'Network Telecom Unit', CURRENT_DATE + INTERVAL '1 day', 1.0, 'Test cellular signal transceiver and reset remote telemetry antenna.', 'LoRaWAN / 4G Antenna Cable', 'Within 48 Hours', NULL),
    ('mr-04', 'WO-2026-1025', 'pole-01', 'Heatsink Servicing', 'MEDIUM', 'COMPLETED', 'Maintenance Team 2', CURRENT_DATE - INTERVAL '1 day', 1.0, 'Clear debris from ventilation fins and verify fanless thermal convection.', 'Thermal Conductive Pad', 'Within 24 Hours', 'Serviced successfully. Operating temperature stabilized at 42°C.')
ON CONFLICT (work_order_id) DO NOTHING;

INSERT INTO system_audit_logs (id, record_id, timestamp, sector, event_type, summary, metric, compliance, logged_by, pole_id)
VALUES
    ('rec-01', 'REC-2026-9841', NOW() - INTERVAL '30 minutes', 'Gateway Corridor', 'AI Dynamic Shift', 'Illumination stepped to 80% following heavy vehicular influx at North Ingress.', '80% Illumination (0.23 kW Sector Load)', 'IRC:SP:72 Compliant', 'AI Regression Engine', 'pole-01'),
    ('rec-02', 'REC-2026-9840', NOW() - INTERVAL '2 hours', 'Expressway Corridor', 'Automated Fault Flag', 'Optical zero lumen reading detected on pole SL-METRO-011. Work order created.', '0 Lumens (0.85A Draw)', 'SLA Dispatched', 'Continuous Anomaly Diagnostic', 'pole-11'),
    ('rec-03', 'REC-2026-9839', NOW() - INTERVAL '6 hours', 'All Metropolitan Sectors', 'Daylight Transition', 'Ambient lux reached 120.0 Lux. Automated daylight shutdown commanded.', '0% Brightness (0.00 kW Grid Load)', 'Optimal Conservation', 'Astronomical / LDR Controller', NULL),
    ('rec-04', 'REC-2026-9838', NOW() - INTERVAL '10 hours', 'Civic Centre Zone', 'Quiet Hours Dimming', 'Security lighting floor engaged across empty plaza corridors.', '20% Brightness (70% Energy Saved)', 'SDG 7 Clean Energy Verified', 'AI Dimming Scheduler', 'pole-03'),
    ('rec-05', 'REC-2026-9837', NOW() - INTERVAL '14 hours', 'Sports & Arena District', 'Driver Failure Alert', 'Pole SL-METRO-006 current dropped to 0.00A under commanded load.', 'Zero Current Draw', 'Maintenance Alert Filed', 'Electrical Health Monitor', 'pole-06')
ON CONFLICT (record_id) DO NOTHING;
