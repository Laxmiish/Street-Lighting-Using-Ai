const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');

router.post('/seed', demoController.seedDatabase);
router.post('/inject-fault', demoController.injectFault);
router.post('/simulate-traffic', demoController.simulateTraffic);

module.exports = router;
