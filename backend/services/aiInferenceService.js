/**
 * LuminaAI — Adaptive Illumination Inference Engine
 * Fully integrated with the Trained UCI Traffic Model & ai_config.md
 * Dual Logic: Proactive Ridge Traffic Regression + Reactive Radar Surge & Daylight Cutoff
 * Regulatory Compliance: Indian Road Congress (IRC:SP:72)
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

const TRAINED_WEIGHTS_PATH = path.resolve(__dirname, '../../ai_model/traffic_model_weights.json');

class AiInferenceService {
  constructor() {
    this.activeConfig = { ...config.aiDefaultConfig };
    this.trainedTrafficModel = null;
    this.loadTrainedWeights();
  }

  /**
   * Load trained Ridge regression weights from ai_model/traffic_model_weights.json
   */
  loadTrainedWeights() {
    try {
      if (fs.existsSync(TRAINED_WEIGHTS_PATH)) {
        const raw = fs.readFileSync(TRAINED_WEIGHTS_PATH, 'utf8');
        this.trainedTrafficModel = JSON.parse(raw);
        console.log('[AI Engine] Successfully loaded trained traffic regression weights from ai_model/traffic_model_weights.json');
      } else {
        console.log('[AI Engine] Trained weights JSON not found; using default built-in configuration.');
      }
    } catch (err) {
      console.warn('[AI Engine] Notice loading weights file:', err.message);
    }
  }

  /**
   * Get active AI configuration and model metadata
   */
  getConfig() {
    return {
      activeConfig: this.activeConfig,
      trafficModel: this.trainedTrafficModel ? {
        modelType: this.trainedTrafficModel.model_type,
        r2Score: this.trainedTrafficModel.metrics?.r2_score,
        rmse: this.trainedTrafficModel.metrics?.rmse,
        samplesTrained: this.trainedTrafficModel.metrics?.samples_trained,
        dimmingPolicy: this.trainedTrafficModel.dimming_policy,
        coefficients: this.trainedTrafficModel.coefficients,
      } : null,
    };
  }

  /**
   * Update dynamic AI configuration parameters
   */
  updateConfig(newParams) {
    this.activeConfig = {
      ...this.activeConfig,
      ...newParams,
      weights: {
        ...this.activeConfig.weights,
        ...(newParams.weights || {}),
      },
    };
    return this.getConfig();
  }

  /**
   * Predict traffic volume (vehicles/hour) using the trained Ridge Regression model
   */
  predictTrafficVolume({ hour = new Date().getHours(), dayOfWeek = new Date().getDay(), tempC = 25.0 }) {
    if (!this.trainedTrafficModel) {
      // Fallback calculation
      const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20);
      return isRushHour ? 4200 : (hour >= 23 || hour <= 4 ? 450 : 2100);
    }

    const { intercept, coefficients } = this.trainedTrafficModel;
    const sinHour = Math.sin((2 * Math.PI * hour) / 24.0);
    const cosHour = Math.cos((2 * Math.PI * hour) / 24.0);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;
    const tempK = tempC + 273.15;

    let predictedTraffic =
      intercept +
      coefficients.hour * hour +
      coefficients.sin_hour * sinHour +
      coefficients.cos_hour * cosHour +
      coefficients.day_of_week * dayOfWeek +
      coefficients.is_weekend * isWeekend +
      coefficients.temp * tempK;

    return Math.max(0, Math.round(predictedTraffic));
  }

  /**
   * Execute real-time closed-loop dimming inference
   * Combines proactive traffic forecasting (Ridge Regression) with reactive radar surges
   * @param {Object} input
   * @param {number} [input.ambientLux=0.0] - Photometrics in Lux (0.0 to 1000+)
   * @param {boolean} [input.motionDetected=false] - Radar/PIR trigger
   * @param {number} [input.hourOfDay] - Hour (0 to 23)
   * @param {number} [input.dayOfWeek] - Day of week (0 to 6)
   * @param {number} [input.tempC=25.0] - Ambient temperature in Celsius
   * @param {string} [input.zone='Civic Centre Zone'] - Corridor name
   * @returns {Object} Final commanded brightness and inference diagnostics
   */
  computeDimming({
    ambientLux = 0.0,
    motionDetected = false,
    hourOfDay = new Date().getHours(),
    dayOfWeek = new Date().getDay(),
    tempC = 25.0,
    zone = 'Civic Centre Zone',
  }) {
    const startTime = process.hrtime.bigint();
    const { nightFloorBrightness, motionBoostBrightness, ambientLuxThreshold } = this.activeConfig;

    // 1. Daylight Cutoff Check (IRC:SP:72 Standard)
    if (ambientLux >= ambientLuxThreshold) {
      const endTime = process.hrtime.bigint();
      return {
        commandedBrightness: 0,
        proactiveBase: 0,
        mode: 'DAYLIGHT_CUTOFF',
        reason: `Ambient light (${ambientLux} lx) exceeds daylight threshold (${ambientLuxThreshold} lx). Automatic shutdown commanded.`,
        inferenceTimeMs: parseFloat((Number(endTime - startTime) / 1e6).toFixed(3)),
        confidence: 0.99,
      };
    }

    // 2. Proactive Traffic Volume Prediction (Ridge Regression from ai_config.md)
    const predictedTraffic = this.predictTrafficVolume({ hour: hourOfDay, dayOfWeek, tempC });
    const maxTraffic = this.trainedTrafficModel?.normalization?.max_traffic || 7280.0;
    const trafficRatio = Math.min(1.0, Math.max(0.0, predictedTraffic / maxTraffic));

    // Zone Criticality Multiplier
    let zoneMultiplier = 1.0;
    const lowerZone = (zone || '').toLowerCase();
    if (lowerZone.includes('expressway') || lowerZone.includes('arterial')) {
      zoneMultiplier = 1.25;
    } else if (lowerZone.includes('gateway') || lowerZone.includes('transit')) {
      zoneMultiplier = 1.15;
    } else if (lowerZone.includes('residential')) {
      zoneMultiplier = 0.85;
    }

    // Calculate Proactive Baseline Brightness (20% to 65% base)
    // Proactively steps up base illumination just before rush hours based on traffic model
    const proactivePeak = this.trainedTrafficModel?.dimming_policy?.proactive_peak_brightness || 65;
    const rawBase = nightFloorBrightness + (trafficRatio * (proactivePeak - nightFloorBrightness) * zoneMultiplier);
    const proactiveBase = Math.min(proactivePeak, Math.max(nightFloorBrightness, Math.round(rawBase)));

    // 3. Reactive Immediate Radar / Motion Surge
    let commandedBrightness = proactiveBase;
    let mode = 'PROACTIVE_TRAFFIC_ADAPTIVE';

    if (motionDetected) {
      // Immediate 85-100% surge upon approaching vehicle/pedestrian
      commandedBrightness = Math.max(motionBoostBrightness, proactiveBase);
      commandedBrightness = Math.min(100, commandedBrightness);
      mode = 'RADAR_MOTION_BOOST';
    } else {
      // Check if late night quiet hours (23:00 to 05:00)
      const isLateNight = hourOfDay >= 23 || hourOfDay < 5;
      if (isLateNight && !motionDetected && trafficRatio < 0.20) {
        commandedBrightness = nightFloorBrightness; // 20% safe security floor
        mode = 'SECURITY_FLOOR_HOLD';
      }
    }

    const endTime = process.hrtime.bigint();
    const inferenceTimeMs = parseFloat((Number(endTime - startTime) / 1e6).toFixed(3));

    return {
      commandedBrightness,
      proactiveBase,
      predictedTrafficVolume: predictedTraffic,
      trafficDensityRatio: parseFloat(trafficRatio.toFixed(3)),
      mode,
      inferenceTimeMs,
      confidence: this.trainedTrafficModel?.metrics?.r2_score || 0.94,
      parameters: {
        hour: hourOfDay,
        dayOfWeek,
        ambientLux,
        motionDetected,
        nightFloor: nightFloorBrightness,
        boostTarget: motionBoostBrightness,
      },
    };
  }
}

module.exports = new AiInferenceService();
