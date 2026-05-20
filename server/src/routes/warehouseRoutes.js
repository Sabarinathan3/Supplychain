const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { protect } = require('../middleware/authMiddleware');
const { adminOrManager, notVendor } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const validators = require('../utils/validators');

// All routes require authentication
router.use(protect);

// Get all warehouses (all authenticated users)
router.get('/', validators.pagination, validate, warehouseController.getAll);

// Get warehouse by ID (all authenticated users)
router.get('/:id', validators.uuid, validate, warehouseController.getById);

// Get warehouse statistics
router.get('/:id/stats', notVendor, validators.uuid, validate, warehouseController.getStats);

// Create warehouse (Admin or Manager only)
router.post('/', adminOrManager, validators.createWarehouse, validate, warehouseController.create);

// Update warehouse (Admin or Manager only)
router.put('/:id', adminOrManager, validators.uuid, validate, warehouseController.update);

// Delete warehouse (Admin or Manager only)
router.delete('/:id', adminOrManager, validators.uuid, validate, warehouseController.delete);

module.exports = router;
