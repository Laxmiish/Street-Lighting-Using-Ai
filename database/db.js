/**
 * Database Connection Module (Pure PostgreSQL + TimescaleDB)
 * LuminaAI — Intelligent Municipal Adaptive Street Lighting Platform
 * Authority: Smart Cities Mission & Urban Local Bodies
 */

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Load environment variables with .env.local priority (untracked private credentials)
const envPaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(__dirname, '../.env.local'),
    path.resolve(__dirname, '../backend/.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../backend/.env'),
];
for (const p of envPaths) {
    if (fs.existsSync(p)) {
        require('dotenv').config({ path: p, override: true });
    }
}

const isSslEnabled = process.env.DB_SSL === 'true' ||
    (process.env.DATABASE_URL && (
        process.env.DATABASE_URL.includes('sslmode=require') ||
        process.env.DATABASE_URL.includes('neon.tech') ||
        process.env.DATABASE_URL.includes('supabase.co') ||
        process.env.DATABASE_URL.includes('render.com') ||
        process.env.DATABASE_URL.includes('aivencloud.com')
    ));

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: parseInt(process.env.DB_POOL_MAX || (process.env.VERCEL ? '3' : '20'), 10),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: isSslEnabled ? { rejectUnauthorized: false } : undefined,
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres123',
        database: process.env.DB_NAME || 'street_lighting_db',
        max: parseInt(process.env.DB_POOL_MAX || (process.env.VERCEL ? '3' : '20'), 10),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: isSslEnabled ? { rejectUnauthorized: false } : undefined,
    };

const pool = new Pool(poolConfig);

// Event listeners for monitoring connection health
pool.on('connect', () => {
    // Client connected to PostgreSQL
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

/**
 * Execute parameterized query
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params = []) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.DEBUG_SQL === 'true') {
            console.log(`[SQL EXEC] ${duration}ms | rows: ${res.rowCount} | query: ${text.slice(0, 80)}...`);
        }
        return res;
    } catch (error) {
        console.error(`[SQL ERROR] query: ${text.slice(0, 100)}`, error.message);
        throw error;
    }
};

/**
 * Execute query and return single row
 */
const getOne = async (text, params = []) => {
    const res = await query(text, params);
    return res.rows[0] || null;
};

/**
 * Execute query and return all rows
 */
const getMany = async (text, params = []) => {
    const res = await query(text, params);
    return res.rows;
};

/**
 * Execute transaction helper
 * @param {Function} callback - Async function receiving transaction client
 */
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

module.exports = {
    pool,
    query,
    getOne,
    getMany,
    transaction,
};
