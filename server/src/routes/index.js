const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const warehouseRoutes = require('./warehouseRoutes');
const productRoutes = require('./productRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const vendorRoutes = require('./vendorRoutes');
const orderRoutes = require('./orderRoutes');
const deliveryRoutes = require('./deliveryRoutes');
const transferRoutes = require('./transferRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/vendors', vendorRoutes);
router.use('/orders', orderRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/transfers', transferRoutes);
router.use('/analytics', analyticsRoutes);

// API info route
router.get('/', (req, res) => {
  res.json({
    message: 'Enterprise Inventory & Supply Chain Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      warehouses: '/api/warehouses',
      products: '/api/products',
      inventory: '/api/inventory',
      vendors: '/api/vendors',
      orders: '/api/orders',
      deliveries: '/api/deliveries',
      transfers: '/api/transfers',
      analytics: '/api/analytics',
    },
    documentation: '/api/docs',
  });
});

module.exports = router;
