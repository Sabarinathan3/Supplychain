const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { adminOrManager, notVendor } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const validators = require('../utils/validators');

// All routes require authentication
router.use(protect);

// Get all inventory
router.get('/', validators.pagination, validate, inventoryController.getAll);

// Get low stock items
router.get('/low-stock', notVendor, inventoryController.getLowStock);

// Scan product (QR/Barcode)
router.post('/scan', adminOrManager, inventoryController.scanProduct);

// Get inventory by warehouse
router.get('/warehouse/:warehouseId', validators.uuid, validate, inventoryController.getWarehouseInventory);

// Get inventory by ID
router.get('/:id', validators.uuid, validate, inventoryController.getById);

// Get transaction history
router.get('/:inventoryId/transactions', validators.uuid, validate, inventoryController.getTransactionHistory);

// Add stock (Admin or Manager only)
router.post('/add', adminOrManager, validators.updateInventory, validate, inventoryController.addStock);

// Remove stock (Admin or Manager only)
router.post('/remove', adminOrManager, inventoryController.removeStock);

// Adjust stock (Admin or Manager only)
router.post('/adjust', adminOrManager, inventoryController.adjustStock);

// Transfer stock between warehouses (Admin or Manager only)
router.post('/transfer', adminOrManager, inventoryController.transferStock);

// Delete inventory (Admin or Manager only)
router.delete('/:id', adminOrManager, validators.uuid, validate, inventoryController.delete);

module.exports = router;
