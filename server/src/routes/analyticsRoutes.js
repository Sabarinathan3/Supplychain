const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { notVendor } = require('../middleware/roleMiddleware');

// All routes require authentication and not vendor role
router.use(protect);
router.use(notVendor);

// Dashboard overview
router.get('/dashboard', analyticsController.getDashboard);

// Inventory analytics
router.get('/inventory', analyticsController.getInventoryAnalytics);

// Order analytics
router.get('/orders', analyticsController.getOrderAnalytics);

// Vendor analytics
router.get('/vendors', analyticsController.getVendorAnalytics);

// Stock movement report
router.get('/stock-movement', analyticsController.getStockMovement);

// Generate custom report
router.get('/report', analyticsController.generateReport);

module.exports = router;
