const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { adminOrManager, notVendor } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const validators = require('../utils/validators');

// All routes require authentication
router.use(protect);

// Get all orders
router.get('/', validators.pagination, validate, orderController.getAll);

// Get order statistics
router.get('/stats', notVendor, orderController.getStats);

// Get order by ID
router.get('/:id', validators.uuid, validate, orderController.getById);

// Create order (Admin or Manager only)
router.post('/', adminOrManager, validators.createOrder, validate, orderController.create);

// Update order status (Admin or Manager only)
router.patch('/:id/status', adminOrManager, validators.uuid, validate, orderController.updateStatus);

// Update order (Admin or Manager only)
router.put('/:id', adminOrManager, validators.uuid, validate, orderController.update);

// Cancel order (Admin or Manager only)
router.post('/:id/cancel', adminOrManager, validators.uuid, validate, orderController.cancel);

// Delete order (Admin or Manager only)
router.delete('/:id', adminOrManager, validators.uuid, validate, orderController.delete);

module.exports = router;
