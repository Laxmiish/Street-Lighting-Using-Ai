/**
 * LuminaAI Backend Configuration
 * Authority: Smart Cities Mission & Directorate of Urban Local Bodies
 */

const path = require('path');
const fs = require('fs');

// Load environment variables with .env.local priority (untracked private credentials)
const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(__dirname, '../.env.local'),
  path.resolve(__dirname, '../../.env.local'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
];
for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath, override: true });
  }
}

module.exports = {
  port: parseInt(process.env.PORT || '5000', 10),
  env: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // Database Connection
  db: {
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
    database: process.env.DB_NAME || 'street_lighting_db',
    ssl: process.env.DB_SSL === 'true',
    maxPool: parseInt(process.env.DB_POOL_MAX || '20', 10),
  },

  // Environmental & Regulatory Constants
  constants: {
    // CEA (Central Electricity Authority, India) grid emission factor (kg CO2 / kWh)
    CO2_EMISSION_FACTOR: 0.82,
    // Average municipal commercial electricity tariff (INR / kWh)
    ENERGY_COST_PER_KWH: 7.50,
    // Minimum mandatory safety illumination floor (IRC:SP:72)
    MIN_SAFETY_FLOOR_BRIGHTNESS: 20,
    // Ambient daylight shut-off threshold (Lux)
    DAYLIGHT_LUX_THRESHOLD: 50.0,
    // Optical decay slew rate (% per second) to prevent visual strobe
    SLEW_RATE_PERCENT_PER_SEC: 2.5,
  },

  // Default AI Adaptive Model Configuration
  aiDefaultConfig: {
    nightFloorBrightness: 20,
    motionBoostBrightness: 80,
    ambientLuxThreshold: 50.0,
    motionHoldSeconds: 45,
    energyCostPerKwh: 7.50,
    weights: {
      intercept: 85.0,
      luxCoeff: -1.25,
      motionBoost: 45.0,
      sineHarmonic: -12.4,
      cosineHarmonic: 18.6,
      trafficDensity: 0.8,
      zoneMultiplier: 10.0,
    },
  },
};
