-- ============================================================================
-- Database Reset / Teardown Script
-- CAUTION: Drops all existing tables, hypertables, and types
-- ============================================================================

DROP TRIGGER IF EXISTS trg_update_poles_timestamp ON poles;
DROP TRIGGER IF EXISTS trg_update_users_timestamp ON users;
DROP FUNCTION IF EXISTS update_timestamp_column();

DROP TABLE IF EXISTS energy_benchmarks CASCADE;
DROP TABLE IF EXISTS ai_brightness_predictions CASCADE;
DROP TABLE IF EXISTS fault_alerts CASCADE;
DROP TABLE IF EXISTS sensor_data CASCADE;
DROP TABLE IF EXISTS poles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

RAISE NOTICE 'Street Lighting database tables dropped cleanly.';
