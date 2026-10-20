/**
 * Vercel Serverless Function Handler
 * Bridges Vercel serverless request invocations to the Express.js application
 * LuminaAI — Intelligent Municipal Adaptive Street Lighting Management Platform
 */

const app = require('../backend/server');

module.exports = (req, res) => {
  return app(req, res);
};
