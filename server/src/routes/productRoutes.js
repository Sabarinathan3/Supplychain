const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { adminOrManager } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const validators = require('../utils/validators');

// All routes require authentication
router.use(protect);

// Get all products
router.get('/', validators.pagination, validate, productController.getAll);

// Get product categories
router.get('/categories', productController.getCategories);

// Get product by SKU/QR/Barcode
router.get('/code/:code', productController.getBySKU);

// Get product by ID
router.get('/:id', validators.uuid, validate, productController.getById);

// Generate QR code for product
router.get('/:id/qr-code', validators.uuid, validate, productController.generateQR);

// Create product (Admin or Manager only)
router.post('/', adminOrManager, validators.createProduct, validate, productController.create);

// Update product (Admin or Manager only)
router.put('/:id', adminOrManager, validators.uuid, validate, productController.update);

// Delete product (Admin or Manager only)
router.delete('/:id', adminOrManager, validators.uuid, validate, productController.delete);

module.exports = router;
