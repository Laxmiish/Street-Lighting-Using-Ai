const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { validateWorkOrder } = require('../middleware/validator');

router.get('/', maintenanceController.getWorkOrders);
router.post('/', validateWorkOrder, maintenanceController.createWorkOrder);
router.put('/:workOrderId/status', maintenanceController.updateWorkOrderStatus);

module.exports = router;
