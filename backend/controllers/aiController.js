/**
 * LuminaAI — AI Adaptive Engine Controller
 * Manages model parameters, regression weights, and test inference predictions.
 */

const aiInferenceService = require('../services/aiInferenceService');
const auditService = require('../services/auditService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get active AI adaptive configuration and trained Ridge traffic regression metadata
 * Endpoint: GET /api/ai/config
 */
exports.getConfig = asyncHandler(async (req, res) => {
  const config = aiInferenceService.getConfig();
  res.json({
    success: true,
    data: config,
  });
});

/**
 * Update AI adaptive parameters
 * Endpoint: PUT /api/ai/config
 */
exports.updateConfig = asyncHandler(async (req, res) => {
  const newParams = req.body;

  const updatedConfig = aiInferenceService.updateConfig(newParams);

  await auditService.logEvent({
    sector: 'All Metropolitan Sectors',
    eventType: 'AI Model Parameter Tuning',
    summary: `AI parameters updated: Floor=${updatedConfig.activeConfig?.nightFloorBrightness}%, Boost=${updatedConfig.activeConfig?.motionBoostBrightness}%, Threshold=${updatedConfig.activeConfig?.ambientLuxThreshold}lx.`,
    metric: `Floor: ${updatedConfig.activeConfig?.nightFloorBrightness}%`,
    compliance: 'Municipal Optimization Applied',
    loggedBy: 'AI Systems Administrator',
  });

  res.json({
    success: true,
    message: 'AI adaptive parameters updated successfully.',
    data: updatedConfig,
  });
});

/**
 * Run test prediction using CH-Ridge Regressor
 * Endpoint: POST /api/ai/predict
 */
exports.predict = asyncHandler(async (req, res) => {
  const {
    ambientLux = 0.0,
    motionDetected = false,
    hourOfDay = new Date().getHours(),
    dayOfWeek = new Date().getDay(),
    tempC = 25.0,
    zone = 'Civic Centre Zone',
  } = req.body;

  const result = aiInferenceService.computeDimming({
    ambientLux: parseFloat(ambientLux),
    motionDetected: Boolean(motionDetected),
    hourOfDay: parseInt(hourOfDay, 10),
    dayOfWeek: parseInt(dayOfWeek, 10),
    tempC: parseFloat(tempC),
    zone,
  });

  res.json({
    success: true,
    data: {
      inputs: {
        ambientLux,
        motionDetected,
        hourOfDay,
        dayOfWeek,
        tempC,
        zone,
      },
      inference: result,
    },
  });
});

/**
 * Predict traffic density and proactive base brightness curve
 * Endpoint: POST /api/ai/predict-traffic
 */
exports.predictTraffic = asyncHandler(async (req, res) => {
  const { hour = new Date().getHours(), dayOfWeek = new Date().getDay(), tempC = 25.0 } = req.body;

  const predictedVolume = aiInferenceService.predictTrafficVolume({
    hour: parseInt(hour, 10),
    dayOfWeek: parseInt(dayOfWeek, 10),
    tempC: parseFloat(tempC),
  });

  res.json({
    success: true,
    data: {
      hour,
      dayOfWeek,
      tempC,
      predictedVehiclesPerHour: predictedVolume,
      proactiveBaseBrightness: Math.min(65, Math.max(20, Math.round(20 + (predictedVolume / 7280) * 45))),
    },
  });
});

/**
 * Reload weights from traffic_model_weights.json
 * Endpoint: POST /api/ai/reload-weights
 */
exports.reloadWeights = asyncHandler(async (req, res) => {
  aiInferenceService.loadTrainedWeights();
  res.json({
    success: true,
    message: 'Trained model weights reloaded into memory.',
    config: aiInferenceService.getConfig(),
  });
});
