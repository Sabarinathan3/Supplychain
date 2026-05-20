const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly, adminOrManager } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const validators = require('../utils/validators');

// All routes require authentication
router.use(protect);

// Get users by role
router.get('/role/:role', adminOrManager, userController.getUsersByRole);

// User CRUD operations (Admin only)
router.get('/', adminOnly, validators.pagination, validate, userController.getAll);
router.post('/', adminOnly, validators.register, validate, userController.create);
router.get('/:id', adminOrManager, validators.uuid, validate, userController.getById);
router.put('/:id', adminOrManager, validators.uuid, validate, userController.update);
router.delete('/:id', adminOnly, validators.uuid, validate, userController.delete);

// User management (Admin only)
router.patch('/:id/deactivate', adminOnly, validators.uuid, validate, userController.deactivate);
router.patch('/:id/activate', adminOnly, validators.uuid, validate, userController.activate);
router.post('/:id/reset-password', adminOnly, validators.uuid, validate, userController.resetPassword);

// User statistics and activity
router.get('/:id/stats', adminOrManager, validators.uuid, validate, userController.getStats);
router.get('/:id/activity', adminOrManager, validators.uuid, validate, userController.getActivity);

module.exports = router;
