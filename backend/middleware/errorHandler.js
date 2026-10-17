/**
 * LuminaAI — Centralized Error Handling Middleware
 * Adheres to Error Abstraction guidelines: protects clients from raw stack traces
 * while logging structured diagnostics internally.
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Internal logging for engineering diagnostics
  console.error(`[API ERROR ${statusCode}] ${req.method} ${req.originalUrl}:`, err.message);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  // User-facing sanitized operational response
  const response = {
    success: false,
    statusCode,
    message: err.isOperational ? err.message : 'An operational service anomaly occurred while processing your request.',
    errorType: err.name || 'InternalServiceError',
  };

  // Only attach diagnostic details in explicit debug mode
  if (process.env.DEBUG_ERRORS === 'true') {
    response.debug = {
      rawMessage: err.message,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(response);
};

module.exports = {
  asyncHandler,
  errorHandler,
};
