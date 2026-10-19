const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.get('/config', aiController.getConfig);
router.put('/config', aiController.updateConfig);
router.post('/predict', aiController.predict);
router.post('/predict-traffic', aiController.predictTraffic);
router.post('/reload-weights', aiController.reloadWeights);

module.exports = router;
