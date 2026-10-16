-- ============================================================================
-- LuminaAI — Intelligent Municipal Adaptive Street Lighting Platform
-- Production PostgreSQL + TimescaleDB Schema Definition (DDL)
-- Authority: Smart Cities Mission & Directorate of Urban Local Bodies
-- Target SDGs: SDG 7 (Clean Energy), SDG 9 (Infrastructure), SDG 11 (Smart Cities), SDG 13 (Climate Action)
-- ============================================================================

-- 0. EXTENSIONS SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TimescaleDB handles high-volume time-series telemetry (partitioned by time)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
    RAISE NOTICE 'TimescaleDB extension enabled.';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TimescaleDB extension not available. Proceeding with standard PostgreSQL partitioned tables.';
END $$;

-- 1. USERS TABLE
-- Manages administrative, operations, and field technician accounts
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
-- Physical pole inventory with geo-coordinates, zone categorization, and active state
CREATE TABLE IF NOT EXISTS poles (
    id VARCHAR(36) PRIMARY KEY,
    pole_code VARCHAR(30) UNIQUE NOT NULL,
    location_name VARCHAR(150) NOT NULL,
    zone VARCHAR(50) NOT NULL DEFAULT 'Main Campus',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DIMMED', 'FAULTY', 'OFFLINE')),
    base_wattage INT NOT NULL DEFAULT 150 CHECK (base_wattage > 0),
    max_lumens INT NOT NULL DEFAULT 18000,
    current_brightness INT NOT NULL DEFAULT 100 CHECK (current_brightness >= 0 AND current_brightness <= 100),
    motion_detected BOOLEAN NOT NULL DEFAULT FALSE,
    mac_address VARCHAR(30),
    firmware_version VARCHAR(20) DEFAULT 'v1.4.2-esp32',
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. SENSOR TELEMETRY TABLE (Hypertable for Time-Series Data)
-- Records real-time ambient light (LDR), motion/traffic flags, power draw, and electrical parameters
CREATE TABLE IF NOT EXISTS sensor_data (
    time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pole_id VARCHAR(36) NOT NULL REFERENCES poles(id) ON DELETE CASCADE,
    ambient_light DOUBLE PRECISION NOT NULL CHECK (ambient_light >= 0),  -- in Lux (0.0 night to 1000+ full daylight)
    motion_detected BOOLEAN NOT NULL DEFAULT FALSE,
    vehicle_detected BOOLEAN NOT NULL DEFAULT FALSE,
    pedestrian_count INT NOT NULL DEFAULT 0,
    current_brightness INT NOT NULL CHECK (current_brightness >= 0 AND current_brightness <= 100), -- 0 to 100%
    power_consumed_kwh DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    voltage DOUBLE PRECISION NOT NULL DEFAULT 230.0,                    -- Volts AC
    current_amps DOUBLE PRECISION NOT NULL DEFAULT 0.65,                 -- Amperes AC
    internal_temp_celsius DOUBLE PRECISION DEFAULT 28.5,               -- Operational temperature of fixture
    lumen_output INT NOT NULL DEFAULT 0,
    PRIMARY KEY (time, pole_id)
);

-- Convert sensor_data into a TimescaleDB hypertable partitioned by time in 1-day chunks
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
        PERFORM create_hypertable('sensor_data', 'time', chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);
        RAISE NOTICE 'sensor_data converted to TimescaleDB hypertable.';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Hypertable conversion skipped (using standard relational table).';
END $$;

-- 4. FAULT & ANOMALY ALERTS TABLE
-- Tracks real-time hardware anomalies (burnout, power loss, sensor failure, communication drops)
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
-- Logs inference predictions vs actual output to monitor model accuracy and drift
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
-- Hourly and daily aggregation comparing un-optimized baseline (always 100%) against AI adaptive control
CREATE TABLE IF NOT EXISTS energy_benchmarks (
    id VARCHAR(36) PRIMARY KEY,
    record_date DATE NOT NULL,
    hour INT NOT NULL CHECK (hour >= 0 AND hour <= 23),
    pole_id VARCHAR(36) REFERENCES poles(id) ON DELETE CASCADE,
    baseline_energy_kwh DOUBLE PRECISION NOT NULL,      -- Energy if burned at 100% constant power
    ai_optimized_energy_kwh DOUBLE PRECISION NOT NULL,  -- Actual power with AI adaptive dimming
    energy_saved_kwh DOUBLE PRECISION NOT NULL,         -- (baseline - actual)
    percentage_saved DOUBLE PRECISION NOT NULL,         -- ((baseline - actual) / baseline) * 100
    co2_avoided_kg DOUBLE PRECISION NOT NULL,           -- based on 0.82 kg CO2 per kWh (India Grid emission factor)
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_pole_hourly_benchmark UNIQUE (record_date, hour, pole_id)
);

-- 7. MAINTENANCE & WORK-ORDERS REGISTER TABLE
-- Formal municipal maintenance tracking: SLA targets, field unit dispatches, and repair audits
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
-- Immutable chronological audit trail register for statutory and governance audits
-- Follows audit-log pattern: timestamp, sector/module, action, operational impact, compliance standard
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

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Fast lookup for pole status and geographical coordinates
CREATE INDEX IF NOT EXISTS idx_poles_status ON poles(status);
CREATE INDEX IF NOT EXISTS idx_poles_zone ON poles(zone);
CREATE INDEX IF NOT EXISTS idx_poles_coords ON poles(latitude, longitude);

-- Fast hypertable time-range and pole telemetry querying
CREATE INDEX IF NOT EXISTS idx_sensor_data_pole_time ON sensor_data(pole_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_data_time_desc ON sensor_data(time DESC);

-- Incident tracking and dashboard active alert counts
CREATE INDEX IF NOT EXISTS idx_fault_alerts_resolved ON fault_alerts(resolved, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fault_alerts_pole ON fault_alerts(pole_id);
CREATE INDEX IF NOT EXISTS idx_fault_alerts_severity ON fault_alerts(severity);

-- Analytics & savings aggregation
CREATE INDEX IF NOT EXISTS idx_energy_benchmarks_date_hour ON energy_benchmarks(record_date DESC, hour ASC);
CREATE INDEX IF NOT EXISTS idx_energy_benchmarks_pole ON energy_benchmarks(pole_id);

-- Predictions auditing
CREATE INDEX IF NOT EXISTS idx_ai_predictions_time ON ai_brightness_predictions(time DESC);

-- Maintenance & SLA tracking
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance_records(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_pole ON maintenance_records(pole_id);

-- System audit trail querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON system_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_sector ON system_audit_logs(sector);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON system_audit_logs(event_type);

-- ============================================================================
-- AUTOMATED TIMESTAMP UPDATER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_poles_timestamp ON poles;
CREATE TRIGGER trg_update_poles_timestamp
BEFORE UPDATE ON poles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_update_users_timestamp ON users;
CREATE TRIGGER trg_update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_update_maintenance_records_timestamp ON maintenance_records;
CREATE TRIGGER trg_update_maintenance_records_timestamp
BEFORE UPDATE ON maintenance_records
FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();
