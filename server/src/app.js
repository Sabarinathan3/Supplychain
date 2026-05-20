const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./config/logger');

const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
}

// Rate limiting
app.use('/api', apiLimiter);

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'Enterprise Inventory & Supply Chain Management API Documentation',
    version: '1.0.0',
    baseUrl: '/api',
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
    },
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'POST /api/auth/change-password',
        logout: 'POST /api/auth/logout',
      },
      users: {
        getAll: 'GET /api/users',
        getById: 'GET /api/users/:id',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
        deactivate: 'PATCH /api/users/:id/deactivate',
        activate: 'PATCH /api/users/:id/activate',
        stats: 'GET /api/users/:id/stats',
        activity: 'GET /api/users/:id/activity',
      },
      warehouses: {
        getAll: 'GET /api/warehouses',
        getById: 'GET /api/warehouses/:id',
        create: 'POST /api/warehouses',
        update: 'PUT /api/warehouses/:id',
        delete: 'DELETE /api/warehouses/:id',
        stats: 'GET /api/warehouses/:id/stats',
      },
      products: {
        getAll: 'GET /api/products',
        getById: 'GET /api/products/:id',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id',
        getBySKU: 'GET /api/products/code/:code',
        generateQR: 'GET /api/products/:id/qr-code',
        categories: 'GET /api/products/categories',
      },
      inventory: {
        getAll: 'GET /api/inventory',
        getById: 'GET /api/inventory/:id',
        addStock: 'POST /api/inventory/add',
        removeStock: 'POST /api/inventory/remove',
        adjustStock: 'POST /api/inventory/adjust',
        transfer: 'POST /api/inventory/transfer',
        lowStock: 'GET /api/inventory/low-stock',
        scan: 'POST /api/inventory/scan',
        transactions: 'GET /api/inventory/:id/transactions',
      },
      vendors: {
        getAll: 'GET /api/vendors',
        getById: 'GET /api/vendors/:id',
        create: 'POST /api/vendors',
        update: 'PUT /api/vendors/:id',
        delete: 'DELETE /api/vendors/:id',
        stats: 'GET /api/vendors/:id/stats',
        orders: 'GET /api/vendors/:id/orders',
      },
      orders: {
        getAll: 'GET /api/orders',
        getById: 'GET /api/orders/:id',
        create: 'POST /api/orders',
        update: 'PUT /api/orders/:id',
        updateStatus: 'PATCH /api/orders/:id/status',
        cancel: 'POST /api/orders/:id/cancel',
        delete: 'DELETE /api/orders/:id',
        stats: 'GET /api/orders/stats',
      },
      deliveries: {
        getAll: 'GET /api/deliveries',
        getById: 'GET /api/deliveries/:id',
        create: 'POST /api/deliveries',
        update: 'PUT /api/deliveries/:id',
        complete: 'POST /api/deliveries/:id/complete',
        track: 'GET /api/deliveries/track/:trackingNumber',
        byOrder: 'GET /api/deliveries/order/:orderId',
      },
      transfers: {
        getAll: 'GET /api/transfers',
        getById: 'GET /api/transfers/:id',
        create: 'POST /api/transfers',
        approve: 'POST /api/transfers/:id/approve',
        reject: 'POST /api/transfers/:id/reject',
        cancel: 'POST /api/transfers/:id/cancel',
        pending: 'GET /api/transfers/pending',
        stats: 'GET /api/transfers/stats',
        byWarehouse: 'GET /api/transfers/warehouse/:warehouseId',
      },
      analytics: {
        dashboard: 'GET /api/analytics/dashboard',
        inventory: 'GET /api/analytics/inventory',
        orders: 'GET /api/analytics/orders',
        vendors: 'GET /api/analytics/vendors',
        stockMovement: 'GET /api/analytics/stock-movement',
        report: 'GET /api/analytics/report',
      },
    },
    roles: {
      ADMIN: 'Full access to all resources',
      WAREHOUSE_MANAGER: 'Manage inventory, orders, and warehouses',
      VENDOR: 'View orders and deliveries only',
      VIEWER: 'Read-only access',
    },
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
