const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { protect } = require('../middleware/authMiddleware');
const { adminOrManager } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const validators = require('../utils/validators');

// All routes require authentication
router.use(protect);

// Get all deliveries
router.get('/', deliveryController.getAll);

// Track delivery by tracking number
router.get('/track/:trackingNumber', deliveryController.track);

// Get delivery by order ID
router.get('/order/:orderId', validators.uuid, validate, deliveryController.getByOrderId);

// Get delivery by ID
router.get('/:id', validators.uuid, validate, deliveryController.getById);

// Create delivery (Admin or Manager only)
router.post('/', adminOrManager, deliveryController.create);

// Update delivery (Admin or Manager only)
router.put('/:id', adminOrManager, validators.uuid, validate, deliveryController.update);

// Complete delivery (Admin or Manager only)
router.post('/:id/complete', adminOrManager, validators.uuid, validate, deliveryController.complete);

// Delete delivery (Admin or Manager only)
router.delete('/:id', adminOrManager, validators.uuid, validate, deliveryController.delete);

module.exports = router;
