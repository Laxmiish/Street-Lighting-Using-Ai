const express = require('express');
const router = express.Router();
const poleController = require('../controllers/poleController');
const { validateBrightness } = require('../middleware/validator');

router.get('/', poleController.getAllPoles);
router.get('/:id', poleController.getPoleById);
router.put('/:id/brightness', validateBrightness, poleController.updateBrightness);
router.post('/:id/motion', poleController.toggleMotion);
router.post('/batch-brightness', poleController.batchBrightness);
router.post('/batch-motion', poleController.batchMotion);

module.exports = router;
