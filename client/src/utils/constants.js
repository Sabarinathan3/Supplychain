// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USERS: '/users',
  WAREHOUSES: '/warehouses',
  PRODUCTS: '/products',
  INVENTORY: '/inventory',
  VENDORS: '/vendors',
  ORDERS: '/orders',
  DELIVERIES: '/deliveries',
  TRANSFERS: '/transfers',
  ANALYTICS: '/analytics',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
  VENDOR: 'VENDOR',
  VIEWER: 'VIEWER',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

// Delivery Status
export const DELIVERY_STATUS = {
  PENDING: 'PENDING',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
};

// Transfer Status
export const TRANSFER_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

// Transaction Types
export const TRANSACTION_TYPES = {
  STOCK_IN: 'STOCK_IN',
  STOCK_OUT: 'STOCK_OUT',
  ADJUSTMENT: 'ADJUSTMENT',
  TRANSFER: 'TRANSFER',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Hardware',
  'Tools',
  'Safety Equipment',
  'Office Supplies',
  'Raw Materials',
  'Finished Goods',
  'Other',
];

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'MMM DD, YYYY hh:mm A',
  TIME: 'hh:mm A',
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#2e7d32',
  WARNING: '#ed6c02',
  ERROR: '#d32f2f',
  INFO: '#0288d1',
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME_MODE: 'themeMode',
  LANGUAGE: 'language',
};

// Socket Events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NOTIFICATION: 'notification',
  LOW_STOCK_ALERT: 'low_stock_alert',
  INVENTORY_UPDATED: 'inventory_updated',
  ORDER_CREATED: 'order_created',
  ORDER_STATUS_CHANGED: 'order_status_changed',
  TRANSFER_CREATED: 'transfer_created',
  TRANSFER_APPROVED: 'transfer_approved',
  DELIVERY_UPDATE: 'delivery_update',
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  SKU_PATTERN: /^[A-Z0-9-]+$/,
};

// Status Colors
export const STATUS_COLORS = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  APPROVED: 'success',
  SHIPPED: 'primary',
  IN_TRANSIT: 'info',
  DELIVERED: 'success',
  COMPLETED: 'success',
  REJECTED: 'error',
  CANCELLED: 'error',
  FAILED: 'error',
};

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export default {
  API_ENDPOINTS,
  USER_ROLES,
  ORDER_STATUS,
  DELIVERY_STATUS,
  TRANSFER_STATUS,
  TRANSACTION_TYPES,
  NOTIFICATION_TYPES,
  PRODUCT_CATEGORIES,
  PAGINATION,
  DATE_FORMATS,
  CHART_COLORS,
  FILE_UPLOAD,
  STORAGE_KEYS,
  SOCKET_EVENTS,
  VALIDATION,
  STATUS_COLORS,
  PRIORITY_LEVELS,
};
