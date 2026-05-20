const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const { adminOrManager, notVendor } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const validators = require('../utils/validators');

// All routes require authentication
router.use(protect);

// Get all vendors
router.get('/', validators.pagination, validate, vendorController.getAll);

// Get vendor by ID
router.get('/:id', validators.uuid, validate, vendorController.getById);

// Get vendor statistics
router.get('/:id/stats', notVendor, validators.uuid, validate, vendorController.getStats);

// Get vendor orders
router.get('/:id/orders', validators.uuid, validate, vendorController.getOrders);

// Create vendor (Admin or Manager only)
router.post('/', adminOrManager, validators.createVendor, validate, vendorController.create);

// Update vendor (Admin or Manager only)
router.put('/:id', adminOrManager, validators.uuid, validate, vendorController.update);

// Delete vendor (Admin or Manager only)
router.delete('/:id', adminOrManager, validators.uuid, validate, vendorController.delete);

module.exports = router;
