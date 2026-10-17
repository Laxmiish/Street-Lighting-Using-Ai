/**
 * LuminaAI — Intelligent Municipal Adaptive Street Lighting Management Platform
 * Production Express.js Application Server
 * Authority: Smart Cities Mission & Directorate of Urban Local Bodies
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// 1. Core Security & Request Parsing Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible integration in dev/dashboard
}));
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. HTTP Request Auditing
if (config.env !== 'test') {
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
}

// 3. Primary Root Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'LuminaAI Municipal Backend Service',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: config.env,
    database: {
      type: 'PostgreSQL 16 + TimescaleDB',
      host: config.db.host,
      database: config.db.database,
    },
  });
});

// 4. API Routes Mounting (support both direct and reverse-proxied /api paths)
app.use('/api', routes);
app.use('/', routes);

// 5. 404 Route Catch-All Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Resource endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// 6. Centralized Error Handler Middleware (Sanitizes Error Messages)
app.use(errorHandler);

// 7. Server Listener (Direct Execution Guard)
if (require.main === module) {
  const server = app.listen(config.port, () => {
    console.log(`[LuminaAI] Municipal Backend Service listening on port ${config.port} (env: ${config.env})`);
    console.log(`[LuminaAI] Health endpoint accessible at http://localhost:${config.port}/health`);
    console.log(`[LuminaAI] API root accessible at http://localhost:${config.port}/api`);
  });

  // Graceful Shutdown Handlers
  const gracefulShutdown = (signal) => {
    console.log(`[LuminaAI] Received ${signal}. Initiating graceful shutdown...`);
    server.close(() => {
      console.log('[LuminaAI] HTTP server closed. Process terminating.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
