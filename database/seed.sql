-- ============================================================================
-- LuminaAI — Intelligent Municipal Adaptive Street Lighting Platform
-- Production Seed Telemetry & Municipal Assets — Lucknow City Deployment
-- Authority: Smart Cities Mission & Directorate of Urban Local Bodies
-- Jurisdiction: Lucknow Municipal Corporation (LMC) & Smart City Lucknow Ltd.
-- Headquarters: Hazratganj / Gomti Nagar, Lucknow, Uttar Pradesh
-- Coordinates: Latitude ~26.8467° N, Longitude ~80.9462° E
-- ============================================================================

-- 1. SEED USERS (Highest Officer + Nodal Zonal Officers + Operations Staff)
-- Default password: "SmartCity@2026"
INSERT INTO users (id, name, email, password_hash, role, phone, is_active)
VALUES 
    -- Highest Executive Authority
    ('u-001', 'Dr. Rajeshwar Rao, IAS', 'director.operations@smartcity.gov', '$2a$10$wE9vWp8e6lE9KqY0.xGgeOF7kZcE7i7Zq7v7k7g9eZq7v7k7g9eZq', 'admin', '+91 98765 43210', TRUE),
    
    -- Nodal Zonal Officers for Lucknow City Administrative Zones
    ('u-010', 'Er. Alok Srivastava', 'nodal.zone1@lucknowsmartcity.gov', '$2a$10$wE9vWp8e6lE9KqY0.xGgeOF7kZcE7i7Zq7v7k7g9eZq7v7k7g9eZq', 'admin', '+91 98765 11001', TRUE),
    ('u-011', 'Er. Pradeep Mishra', 'nodal.zone4@lucknowsmartcity.gov', '$2a$10$wE9vWp8e6lE9KqY0.xGgeOF7kZcE7i7Zq7v7k7g9eZq7v7k7g9eZq', 'admin', '+91 98765 11004', TRUE),
    ('u-012', 'Er. Sunil Verma', 'nodal.zone5@lucknowsmartcity.gov', '$2a$10$wE9vWp8e6lE9KqY0.xGgeOF7kZcE7i7Zq7v7k7g9eZq7v7k7g9eZq', 'admin', '+91 98765 11005', TRUE),
    ('u-013', 'Er. R.K. Pandey', 'nodal.zone6@lucknowsmartcity.gov', '$2a$10$wE9vWp8e6lE9KqY0.xGgeOF7kZcE7i7Zq7v7k7g9eZq7v7k7g9eZq', 'admin', '+91 98765 11006', TRUE),
    ('u-014', 'Er. Neha Tripathi', 'nodal.zone3@lucknowsmartcity.gov', '$2a$10$wE9vWp8e6lE9KqY0.xGgeOF7kZcE7i7Zq7v7k7g9eZq7v7k7g9eZq', 'admin', '+91 98765 11003', TRUE),
    ('u-015', 'Er. Sanjay Yadav', 'nodal.zone2@lucknowsmartcity.gov', '$2a$10$wE9vWp8e6lE9KqY0.xGgeOF7kZcE7i7Zq7v7k7g9eZq7v7k7g9eZq', 'admin', '+91 98765 11002', TRUE),

    -- Operations & Field Staff
    ('u-003', 'Vikramaditya Sharma', 'operator.dispatch@smartcity.gov', '$2a$10$wE9vWp8e6lE9KqY0.xGgeOF7kZcE7i7Zq7v7k7g9eZq7v7k7g9eZq', 'operator', '+91 98765 43212', TRUE),
    ('u-004', 'Mahesh Kumar', 'technician.field@smartcity.gov', '$2a$10$wE9vWp8e6lE9KqY0.xGgeOF7kZcE7i7Zq7v7k7g9eZq7v7k7g9eZq', 'technician', '+91 98765 43213', TRUE)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone;

-- 2. SEED LUCKNOW SMART STREET LIGHT POLES (Real Geolocation & Arterials)
INSERT INTO poles (id, pole_code, location_name, zone, latitude, longitude, status, base_wattage, max_lumens, current_brightness, motion_detected, mac_address)
VALUES
    -- Zone 1: Hazratganj Heritage & Administrative Promenade
    ('pole-lko-01', 'LKO-HZG-001', 'Atal Chowk Crossing, Hazratganj', 'Zone 1: Hazratganj', 26.8524, 80.9416, 'ACTIVE', 150, 18000, 85, TRUE, '24:6F:28:LK:01:01'),
    ('pole-lko-02', 'LKO-HZG-002', 'Vidhan Sabha Marg North Corridor', 'Zone 1: Hazratganj', 26.8458, 80.9387, 'ACTIVE', 150, 18000, 75, TRUE, '24:6F:28:LK:01:02'),
    ('pole-lko-03', 'LKO-HZG-003', 'Raj Bhavan VIP Access Way', 'Zone 1: Hazratganj', 26.8485, 80.9442, 'ACTIVE', 120, 14000, 60, FALSE, '24:6F:28:LK:01:03'),
    ('pole-lko-04', 'LKO-HZG-004', 'GPO Circle & Mahatma Gandhi Marg', 'Zone 1: Hazratganj', 26.8502, 80.9405, 'ACTIVE', 120, 14000, 70, FALSE, '24:6F:28:LK:01:04'),
    ('pole-lko-05', 'LKO-HZG-005', 'Begum Hazrat Mahal Park Promenade', 'Zone 1: Hazratganj', 26.8561, 80.9388, 'DIMMED', 100, 12000, 25, FALSE, '24:6F:28:LK:01:05'),

    -- Zone 4: Gomti Nagar & Shaheed Path Arterial
    ('pole-lko-06', 'LKO-GMN-001', 'Vipin Khand Commercial Cyber Axis', 'Zone 4: Gomti Nagar', 26.8548, 80.9932, 'ACTIVE', 150, 18000, 80, TRUE, '24:6F:28:LK:04:01'),
    ('pole-lko-07', 'LKO-GMN-002', 'Patrakarpuram Square North', 'Zone 4: Gomti Nagar', 26.8512, 81.0025, 'ACTIVE', 120, 14000, 65, FALSE, '24:6F:28:LK:04:02'),
    ('pole-lko-08', 'LKO-SHP-001', 'Amar Shaheed Path Elevated Median 1', 'Zone 4: Gomti Nagar', 26.8375, 81.0145, 'ACTIVE', 250, 30000, 95, TRUE, '24:6F:28:LK:04:03'),
    ('pole-lko-09', 'LKO-SHP-002', 'Amar Shaheed Path Ekana Stadium Interchange', 'Zone 4: Gomti Nagar', 26.8095, 81.0175, 'ACTIVE', 250, 30000, 90, TRUE, '24:6F:28:LK:04:04'),
    ('pole-lko-10', 'LKO-SHP-003', 'Amar Shaheed Path Flyover Median 3', 'Zone 4: Gomti Nagar', 26.8250, 81.0160, 'FAULTY', 250, 30000, 0, FALSE, '24:6F:28:LK:04:05'),
    ('pole-lko-11', 'LKO-GMN-003', 'Gomti Riverfront Promenade South', 'Zone 4: Gomti Nagar', 26.8622, 80.9654, 'DIMMED', 100, 12000, 20, FALSE, '24:6F:28:LK:04:06'),

    -- Zone 5: Alambagh & Transport Corridor
    ('pole-lko-12', 'LKO-ALM-001', 'Alambagh Intermodal Bus Terminal Forecourt', 'Zone 5: Alambagh', 26.8182, 80.9085, 'ACTIVE', 180, 22000, 85, TRUE, '24:6F:28:LK:05:01'),
    ('pole-lko-13', 'LKO-ALM-002', 'Kanpur Road Highway Flyover Ingress', 'Zone 5: Alambagh', 26.8125, 80.9015, 'ACTIVE', 200, 24000, 80, TRUE, '24:6F:28:LK:05:02'),
    ('pole-lko-14', 'LKO-ALM-003', 'Transport Nagar Logistics Terminal Axis', 'Zone 5: Alambagh', 26.7952, 80.8872, 'DIMMED', 150, 18000, 30, FALSE, '24:6F:28:LK:05:03'),
    ('pole-lko-15', 'LKO-ALM-004', 'Alambagh Metro Station Junction East', 'Zone 5: Alambagh', 26.8195, 80.9102, 'FAULTY', 150, 18000, 0, FALSE, '24:6F:28:LK:05:04'),

    -- Zone 6: Chowk & Old Lucknow Heritage Precinct
    ('pole-lko-16', 'LKO-CWK-001', 'Rumi Darwaza Heritage Boulevard', 'Zone 6: Chowk Heritage', 26.8698, 80.9128, 'ACTIVE', 120, 14000, 60, FALSE, '24:6F:28:LK:06:01'),
    ('pole-lko-17', 'LKO-CWK-002', 'Bara Imambara Avenue Forecourt', 'Zone 6: Chowk Heritage', 26.8715, 80.9145, 'ACTIVE', 120, 14000, 60, FALSE, '24:6F:28:LK:06:02'),
    ('pole-lko-18', 'LKO-CWK-003', 'Chowk Kotwali & Saraf Bazaar Arterial', 'Zone 6: Chowk Heritage', 26.8615, 80.9082, 'DIMMED', 100, 12000, 25, FALSE, '24:6F:28:LK:06:03'),
    ('pole-lko-19', 'LKO-CWK-004', 'Victoria Street Heritage Connector', 'Zone 6: Chowk Heritage', 26.8640, 80.9110, 'OFFLINE', 100, 12000, 0, FALSE, '24:6F:28:LK:06:04'),

    -- Zone 3: Indira Nagar & Ring Road Corridor
    ('pole-lko-20', 'LKO-IDN-001', 'Munshi Pulia Metro Hub Intersection', 'Zone 3: Indira Nagar', 26.8856, 80.9952, 'ACTIVE', 150, 18000, 80, TRUE, '24:6F:28:LK:03:01'),
    ('pole-lko-21', 'LKO-IDN-002', 'Ring Road Polytech Flyover North', 'Zone 3: Indira Nagar', 26.8785, 80.9882, 'ACTIVE', 180, 22000, 85, TRUE, '24:6F:28:LK:03:02'),
    ('pole-lko-22', 'LKO-IDN-003', 'Bhootnath Market Commercial Avenue', 'Zone 3: Indira Nagar', 26.8712, 80.9815, 'ACTIVE', 120, 14000, 70, FALSE, '24:6F:28:LK:03:03'),

    -- Zone 2: Charbagh & Aishbagh Junction
    ('pole-lko-23', 'LKO-CBG-001', 'Charbagh Central Railway Station Forecourt', 'Zone 2: Charbagh', 26.8315, 80.9235, 'ACTIVE', 200, 24000, 90, TRUE, '24:6F:28:LK:02:01'),
    ('pole-lko-24', 'LKO-CBG-002', 'Gautam Buddha Marg West', 'Zone 2: Charbagh', 26.8392, 80.9278, 'ACTIVE', 150, 18000, 75, FALSE, '24:6F:28:LK:02:02'),
    ('pole-lko-25', 'LKO-CBG-003', 'Aishbagh Industrial Overbridge', 'Zone 2: Charbagh', 26.8340, 80.9150, 'DIMMED', 120, 14000, 20, FALSE, '24:6F:28:LK:02:03')
ON CONFLICT (id) DO UPDATE SET 
    pole_code = EXCLUDED.pole_code,
    location_name = EXCLUDED.location_name,
    zone = EXCLUDED.zone,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    status = EXCLUDED.status,
    base_wattage = EXCLUDED.base_wattage,
    max_lumens = EXCLUDED.max_lumens,
    current_brightness = EXCLUDED.current_brightness,
    motion_detected = EXCLUDED.motion_detected;

-- 3. SEED FAULT ALERTS (Real Municipal Issues across Lucknow)
INSERT INTO fault_alerts (id, pole_id, timestamp, fault_type, severity, description, assigned_to, resolved, resolved_at, resolution_notes)
VALUES
    ('alert-lko-001', 'pole-lko-10', NOW() - INTERVAL '1 hour 45 minutes', 'NO_POWER', 'CRITICAL', 'Zero current draw detected (0.00A) on Amar Shaheed Path Flyover Median 3. High-speed corridor dark fixture.', 'u-004', FALSE, NULL, NULL),
    ('alert-lko-002', 'pole-lko-15', NOW() - INTERVAL '4 hours 10 minutes', 'BULB_BURNOUT', 'CRITICAL', 'Zero lumen feedback on Alambagh Metro Junction East fixture despite nominal 150W draw. Photodiode confirms bulb failure.', 'u-004', FALSE, NULL, NULL),
    ('alert-lko-003', 'pole-lko-19', NOW() - INTERVAL '7 hours 20 minutes', 'COMM_TIMEOUT', 'WARNING', 'Cellular IoT gateway timeout on Victoria Street Connector (Chowk). Heartbeat missing for over 45 minutes.', NULL, FALSE, NULL, NULL),
    ('alert-lko-004', 'pole-lko-01', NOW() - INTERVAL '16 hours', 'HIGH_TEMPERATURE', 'WARNING', 'Heatsink thermal warning at Atal Chowk, Hazratganj (72.8°C). Autonomous thermal dimming engaged.', 'u-004', TRUE, NOW() - INTERVAL '13 hours', 'Heatsink serviced, dust cleared. Temperature stabilized at 41.5°C.'),
    ('alert-lko-005', 'pole-lko-20', NOW() - INTERVAL '1 day 8 hours', 'SENSOR_FAIL', 'INFO', 'Radar sensor intermittent false triggers at Munshi Pulia intersection. Recalibrated remotely.', 'u-003', TRUE, NOW() - INTERVAL '1 day 2 hours', 'Radar detection threshold adjusted to 0.85 via remote OTA firmware command.')
ON CONFLICT (id) DO UPDATE SET 
    description = EXCLUDED.description,
    resolved = EXCLUDED.resolved;

-- 4. SEED 24-HOUR REALISTIC SENSOR TELEMETRY (For Key Poles: Hazratganj Atal Chowk & Shaheed Path)
INSERT INTO sensor_data (time, pole_id, ambient_light, motion_detected, vehicle_detected, pedestrian_count, current_brightness, power_consumed_kwh, voltage, current_amps, internal_temp_celsius, lumen_output)
VALUES
    (NOW() - INTERVAL '24 hours', 'pole-lko-01', 0.2, FALSE, FALSE, 0, 25, 0.038, 230.5, 0.16, 24.2, 4500),
    (NOW() - INTERVAL '23 hours', 'pole-lko-01', 0.1, FALSE, FALSE, 0, 25, 0.038, 231.0, 0.16, 23.8, 4500),
    (NOW() - INTERVAL '22 hours', 'pole-lko-01', 0.0, TRUE,  TRUE,  2, 85, 0.128, 229.8, 0.55, 28.5, 15300),
    (NOW() - INTERVAL '21 hours', 'pole-lko-01', 0.0, FALSE, FALSE, 0, 25, 0.038, 230.2, 0.16, 24.0, 4500),
    (NOW() - INTERVAL '20 hours', 'pole-lko-01', 0.0, FALSE, FALSE, 0, 25, 0.038, 230.1, 0.16, 23.5, 4500),
    (NOW() - INTERVAL '19 hours', 'pole-lko-01', 12.5, TRUE, TRUE,  5, 60, 0.090, 229.5, 0.39, 26.1, 10800),
    (NOW() - INTERVAL '18 hours', 'pole-lko-01', 120.0, TRUE, TRUE, 15, 10, 0.015, 230.0, 0.07, 25.0, 1800),
    (NOW() - INTERVAL '17 hours', 'pole-lko-01', 450.0, TRUE, TRUE, 30, 0,  0.000, 230.4, 0.00, 27.2, 0),
    (NOW() - INTERVAL '16 hours', 'pole-lko-01', 780.0, TRUE, TRUE, 45, 0,  0.000, 231.2, 0.00, 31.0, 0),
    (NOW() - INTERVAL '15 hours', 'pole-lko-01', 940.0, TRUE, TRUE, 20, 0,  0.000, 231.8, 0.00, 34.5, 0),
    (NOW() - INTERVAL '14 hours', 'pole-lko-01', 990.0, FALSE, TRUE, 12, 0, 0.000, 232.0, 0.00, 36.8, 0),
    (NOW() - INTERVAL '13 hours', 'pole-lko-01', 980.0, FALSE, TRUE, 8,  0, 0.000, 231.5, 0.00, 36.2, 0),
    (NOW() - INTERVAL '12 hours', 'pole-lko-01', 890.0, TRUE,  TRUE, 25, 0, 0.000, 230.9, 0.00, 35.1, 0),
    (NOW() - INTERVAL '11 hours', 'pole-lko-01', 650.0, TRUE,  TRUE, 35, 0, 0.000, 230.5, 0.00, 33.0, 0),
    (NOW() - INTERVAL '10 hours', 'pole-lko-01', 320.0, TRUE,  TRUE, 48, 0, 0.000, 230.2, 0.00, 30.8, 0),
    (NOW() - INTERVAL '9 hours',  'pole-lko-01', 85.0,  TRUE,  TRUE, 60, 45, 0.068, 229.4, 0.29, 29.5, 8100),
    (NOW() - INTERVAL '8 hours',  'pole-lko-01', 15.0,  TRUE,  TRUE, 75, 75, 0.112, 228.9, 0.49, 32.4, 13500),
    (NOW() - INTERVAL '7 hours',  'pole-lko-01', 0.8,   TRUE,  TRUE, 90, 85, 0.128, 228.2, 0.55, 36.0, 15300),
    (NOW() - INTERVAL '6 hours',  'pole-lko-01', 0.0,   TRUE,  TRUE, 85, 85, 0.128, 228.6, 0.55, 36.5, 15300),
    (NOW() - INTERVAL '5 hours',  'pole-lko-01', 0.0,   TRUE,  TRUE, 55, 80, 0.120, 229.1, 0.52, 35.0, 14400),
    (NOW() - INTERVAL '4 hours',  'pole-lko-01', 0.0,   TRUE,  FALSE, 24, 60, 0.090, 229.7, 0.39, 31.8, 10800),
    (NOW() - INTERVAL '3 hours',  'pole-lko-01', 0.0,   FALSE, FALSE, 4,  30, 0.045, 230.2, 0.20, 27.5, 5400),
    (NOW() - INTERVAL '2 hours',  'pole-lko-01', 0.0,   FALSE, FALSE, 0,  25, 0.038, 230.8, 0.16, 25.2, 4500),
    (NOW() - INTERVAL '1 hour',   'pole-lko-01', 0.0,   TRUE,  TRUE,  2,  85, 0.128, 229.9, 0.55, 29.0, 15300),
    (NOW(),                       'pole-lko-01', 0.0,   TRUE,  TRUE,  3,  85, 0.128, 230.1, 0.55, 28.7, 15300)
ON CONFLICT (time, pole_id) DO NOTHING;

-- 5. SEED 24-HOUR ENERGY BENCHMARKS FOR LUCKNOW MUNICIPAL GRID
INSERT INTO energy_benchmarks (id, record_date, hour, pole_id, baseline_energy_kwh, ai_optimized_energy_kwh, energy_saved_kwh, percentage_saved, co2_avoided_kg)
VALUES
    ('bm-lko-00', CURRENT_DATE, 0,  'pole-lko-01', 0.150, 0.038, 0.112, 74.67, 0.092),
    ('bm-lko-01', CURRENT_DATE, 1,  'pole-lko-01', 0.150, 0.038, 0.112, 74.67, 0.092),
    ('bm-lko-02', CURRENT_DATE, 2,  'pole-lko-01', 0.150, 0.045, 0.105, 70.00, 0.086),
    ('bm-lko-03', CURRENT_DATE, 3,  'pole-lko-01', 0.150, 0.038, 0.112, 74.67, 0.092),
    ('bm-lko-04', CURRENT_DATE, 4,  'pole-lko-01', 0.150, 0.038, 0.112, 74.67, 0.092),
    ('bm-lko-05', CURRENT_DATE, 5,  'pole-lko-01', 0.150, 0.090, 0.060, 40.00, 0.049),
    ('bm-lko-06', CURRENT_DATE, 6,  'pole-lko-01', 0.150, 0.015, 0.135, 90.00, 0.111),
    ('bm-lko-07', CURRENT_DATE, 7,  'pole-lko-01', 0.000, 0.000, 0.000, 0.00,  0.000),
    ('bm-lko-08', CURRENT_DATE, 8,  'pole-lko-01', 0.000, 0.000, 0.000, 0.00,  0.000),
    ('bm-lko-09', CURRENT_DATE, 9,  'pole-lko-01', 0.000, 0.000, 0.000, 0.00,  0.000),
    ('bm-lko-10', CURRENT_DATE, 10, 'pole-lko-01', 0.000, 0.000, 0.000, 0.00,  0.000),
    ('bm-lko-11', CURRENT_DATE, 11, 'pole-lko-01', 0.000, 0.000, 0.000, 0.00,  0.000),
    ('bm-lko-12', CURRENT_DATE, 12, 'pole-lko-01', 0.000, 0.000, 0.000, 0.00,  0.000),
    ('bm-lko-13', CURRENT_DATE, 13, 'pole-lko-01', 0.000, 0.000, 0.000, 0.00,  0.000),
    ('bm-lko-14', CURRENT_DATE, 14, 'pole-lko-01', 0.000, 0.000, 0.000, 0.00,  0.000),
    ('bm-lko-15', CURRENT_DATE, 15, 'pole-lko-01', 0.000, 0.000, 0.000, 0.00,  0.000),
    ('bm-lko-16', CURRENT_DATE, 16, 'pole-lko-01', 0.000, 0.000, 0.000, 0.00,  0.000),
    ('bm-lko-17', CURRENT_DATE, 17, 'pole-lko-01', 0.050, 0.015, 0.035, 70.00, 0.029),
    ('bm-lko-18', CURRENT_DATE, 18, 'pole-lko-01', 0.150, 0.112, 0.038, 25.33, 0.031),
    ('bm-lko-19', CURRENT_DATE, 19, 'pole-lko-01', 0.150, 0.128, 0.022, 14.67, 0.018),
    ('bm-lko-20', CURRENT_DATE, 20, 'pole-lko-01', 0.150, 0.128, 0.022, 14.67, 0.018),
    ('bm-lko-21', CURRENT_DATE, 21, 'pole-lko-01', 0.150, 0.120, 0.030, 20.00, 0.025),
    ('bm-lko-22', CURRENT_DATE, 22, 'pole-lko-01', 0.150, 0.090, 0.060, 40.00, 0.049),
    ('bm-lko-23', CURRENT_DATE, 23, 'pole-lko-01', 0.150, 0.045, 0.105, 70.00, 0.086)
ON CONFLICT (record_date, hour, pole_id) DO NOTHING;

-- 6. SEED MUNICIPAL MAINTENANCE WORK ORDERS (Lucknow City Jurisdiction)
INSERT INTO maintenance_records (id, work_order_id, pole_id, category, priority, status, assigned_technician, scheduled_date, estimated_hours, description, parts_required, sla_deadline)
VALUES
    ('m-lko-01', 'WO-LKO-2026-081', 'pole-lko-10', 'LED Driver Replacement', 'CRITICAL', 'SCHEDULED', 'Mahesh Kumar', CURRENT_DATE, 2.5, 'Zero current draw on Amar Shaheed Path Flyover Median 3. Replace 250W MeanWell LED driver unit.', 'LED Driver 250W IP67, Surge Protector 10kV', 'Tonight by 23:00 IST'),
    ('m-lko-02', 'WO-LKO-2026-082', 'pole-lko-15', 'Bulb / Module Burnout', 'CRITICAL', 'DISPATCHED', 'Mahesh Kumar', CURRENT_DATE, 1.5, 'Lumen sensor indicates zero light on Alambagh Metro Junction East fixture despite nominal 150W draw. Check luminaire and ballast.', 'COB LED Module 150W 5000K, Terminal Block', 'Within 4 Hours'),
    ('m-lko-03', 'WO-LKO-2026-083', 'pole-lko-19', 'IoT Gateway Inspection', 'HIGH', 'IN_PROGRESS', 'Mahesh Kumar', CURRENT_DATE, 2.0, 'Cellular telemetry packet drop on Victoria Street Connector (Chowk). Inspect SIM card & antenna.', '4G LTE Stub Antenna, SIM Tray replacement', 'Tomorrow Morning 09:00 IST'),
    ('m-lko-04', 'WO-LKO-2026-079', 'pole-lko-01', 'Thermal Heatsink Cleanse', 'MEDIUM', 'COMPLETED', 'Mahesh Kumar', CURRENT_DATE - INTERVAL '1 day', 1.0, 'Thermal throttling alert at Atal Chowk, Hazratganj. Cleaned dust buildup and reseated thermal paste.', 'Thermal Grease 5g, Silicone Seal Gasket', 'Completed on Time')
ON CONFLICT (id) DO UPDATE SET 
    status = EXCLUDED.status,
    description = EXCLUDED.description;

-- 7. SEED SYSTEM AUDIT LOGS (Statutory Compliance for Lucknow Municipal Corporation)
INSERT INTO system_audit_logs (id, record_id, timestamp, sector, event_type, summary, metric, compliance, logged_by, pole_id)
VALUES
    ('aud-lko-01', 'AUD-LKO-2601', NOW() - INTERVAL '15 minutes', 'Zone 4: Gomti Nagar', 'Autonomous Dimming Adjustment', 'Closed-loop AI dimmed Shaheed Path auxiliary lanes to 25% floor during quiet late-night window.', 'Energy Conserved: 1.42 kWh', 'IRC:SP:72 Compliant', 'Autonomous AI Core', 'pole-lko-06'),
    ('aud-lko-02', 'AUD-LKO-2602', NOW() - INTERVAL '45 minutes', 'Zone 1: Hazratganj', 'Radar Traffic Detection', 'Pedestrian traffic surge near Atal Chowk. Brightness elevated from 40% to 85% smoothly.', 'Ramp Time: 1.2s', 'Road Safety Standards', 'Radar Sensor Array', 'pole-lko-01'),
    ('aud-lko-03', 'AUD-LKO-2603', NOW() - INTERVAL '2 hours', 'Zone 5: Alambagh', 'Technician Dispatch Notification', 'Work order WO-LKO-2026-082 created and assigned to Rapid Response Unit 4 for Alambagh Metro fixture.', 'SLA Target: 4 Hours', 'Municipal Citizen Charter', 'Control Dispatch Engine', 'pole-lko-15'),
    ('aud-lko-04', 'AUD-LKO-2604', NOW() - INTERVAL '6 hours', 'Citywide Lucknow Grid', 'Diurnal Twilight Ignition', 'Ambient lux dropped below 50.0 Lux. Synchronized progressive twilight ramp across all 6 administrative zones.', 'Poles Engaged: 25 Fixtures', 'BEE Energy Standards', 'LDR Telemetry Service', NULL)
ON CONFLICT (id) DO NOTHING;
