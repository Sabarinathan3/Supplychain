const { body, param, query } = require('express-validator');

const validators = {
  // Auth validators
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('role').optional().isIn(['ADMIN', 'WAREHOUSE_MANAGER', 'VENDOR', 'VIEWER']),
  ],

  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  // Warehouse validators
  createWarehouse: [
    body('name').trim().notEmpty().withMessage('Warehouse name is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Valid capacity required'),
  ],

  // Product validators
  createProduct: [
    body('sku').trim().notEmpty().withMessage('SKU is required'),
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('unitPrice').isFloat({ min: 0 }).withMessage('Valid unit price required'),
    body('reorderLevel').optional().isInt({ min: 0 }),
  ],

  // Inventory validators
  updateInventory: [
    body('productId').isUUID().withMessage('Valid product ID required'),
    body('warehouseId').isUUID().withMessage('Valid warehouse ID required'),
    body('quantity').isInt({ min: 0 }).withMessage('Valid quantity required'),
  ],

  // Order validators
  createOrder: [
    body('vendorId').isUUID().withMessage('Valid vendor ID required'),
    body('orderItems').isArray({ min: 1 }).withMessage('Order items required'),
    body('orderItems.*.productId').isUUID().withMessage('Valid product ID required'),
    body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity required'),
    body('orderItems.*.unitPrice').isFloat({ min: 0 }).withMessage('Valid price required'),
  ],

  // Vendor validators
  createVendor: [
    body('name').trim().notEmpty().withMessage('Vendor name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('contactPerson').trim().notEmpty().withMessage('Contact person required'),
  ],

  // UUID param validator
  uuid: [
    param('id').isUUID().withMessage('Valid UUID required'),
  ],

  // Pagination validators
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Valid page number required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
};

module.exports = validators;
