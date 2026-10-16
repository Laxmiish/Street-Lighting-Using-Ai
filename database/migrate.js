/**
 * Database Migration & Seeding Runner
 * Intelligent Street Lighting System Using AI
 *
 * Runs schema.sql, views.sql, and seed.sql against PostgreSQL + TimescaleDB.
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function getConnectedClient(retries = 6, delayMs = 2000) {
    for (let i = 1; i <= retries; i++) {
        try {
            return await pool.connect();
        } catch (err) {
            if (i === retries) throw err;
            console.log(`[Connecting...] Waiting for PostgreSQL container to be ready (attempt ${i}/${retries})...`);
            await new Promise(r => setTimeout(r, delayMs));
        }
    }
}

async function runMigration() {
    console.log('====================================================');
    console.log('   Street Lighting AI - PostgreSQL Migration Runner ');
    console.log('====================================================');

    let client;
    try {
        client = await getConnectedClient();
        console.log('[1/3] Applying Schema DDL (schema.sql)...');
        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
        await client.query(schemaSql);
        console.log('       ✓ Schema and hypertables applied.');

        console.log('[2/3] Applying Views & Analytical Aggregates (views.sql)...');
        const viewsSql = fs.readFileSync(path.join(__dirname, 'views.sql'), 'utf-8');
        await client.query(viewsSql);
        console.log('       ✓ Views applied.');

        console.log('[3/3] Ingesting Seed Data (seed.sql)...');
        const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
        await client.query(seedSql);
        console.log('       ✓ Seed data inserted.');

        console.log('====================================================');
        console.log('   PostgreSQL Database Migration Completed Successfully!');
        console.log('====================================================');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exitCode = 1;
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

if (require.main === module) {
    runMigration();
}

module.exports = { runMigration };
