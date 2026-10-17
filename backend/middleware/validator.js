/**
 * LuminaAI — Request Payload Validation Middleware
 */

const validateBrightness = (req, res, next) => {
  const { brightness } = req.body;
  if (brightness === undefined || typeof brightness !== 'number' || brightness < 0 || brightness > 100) {
    return res.status(400).json({
      success: false,
      message: 'Invalid brightness value. Must be an integer between 0 and 100.',
    });
  }
  next();
};

const validateTelemetry = (req, res, next) => {
  const poleId = req.body.poleId || req.body.pole_id;
  if (!poleId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required field: poleId or pole_id.',
    });
  }
  const ambientLux = req.body.ambientLux !== undefined ? req.body.ambientLux : (req.body.sensors?.lux);
  if (ambientLux !== undefined && (typeof ambientLux !== 'number' || ambientLux < 0)) {
    return res.status(400).json({
      success: false,
      message: 'ambientLux must be a non-negative number.',
    });
  }
  next();
};

const validateWorkOrder = (req, res, next) => {
  const { poleId, category, priority, description } = req.body;
  if (!poleId || !category || !description) {
    return res.status(400).json({
      success: false,
      message: 'Missing required work order fields: poleId, category, and description are mandatory.',
    });
  }
  if (priority && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
    return res.status(400).json({
      success: false,
      message: 'Priority must be one of: LOW, MEDIUM, HIGH, CRITICAL.',
    });
  }
  next();
};

module.exports = {
  validateBrightness,
  validateTelemetry,
  validateWorkOrder,
};
