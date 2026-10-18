const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');
const { validateTelemetry } = require('../middleware/validator');

router.post('/', validateTelemetry, telemetryController.ingestTelemetry);
router.post('/ingest', validateTelemetry, telemetryController.ingestTelemetry);
router.get('/history/:poleId', telemetryController.getPoleTelemetryHistory);

module.exports = router;
