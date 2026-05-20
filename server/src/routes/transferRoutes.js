const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { protect } = require('../middleware/authMiddleware');
const { adminOrManager } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const validators = require('../utils/validators');

// All routes require authentication
router.use(protect);
router.use(adminOrManager); // All transfer routes require Admin or Manager role

// Get all transfers
router.get('/', validators.pagination, validate, transferController.getAll);

// Get pending transfers
router.get('/pending', transferController.getPending);

// Get transfer statistics
router.get('/stats', transferController.getStats);

// Get transfers by warehouse
router.get('/warehouse/:warehouseId', validators.uuid, validate, transferController.getByWarehouse);

// Get transfer by ID
router.get('/:id', validators.uuid, validate, transferController.getById);

// Create transfer request
router.post('/', transferController.create);

// Approve transfer
router.post('/:id/approve', validators.uuid, validate, transferController.approve);

// Reject transfer
router.post('/:id/reject', validators.uuid, validate, transferController.reject);

// Cancel transfer
router.post('/:id/cancel', validators.uuid, validate, transferController.cancel);

// Delete transfer
router.delete('/:id', validators.uuid, validate, transferController.delete);

module.exports = router;
