const crypto = require('crypto');

const helpers = {
  // Generate unique order number
  generateOrderNumber: () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ORD-${year}${month}-${random}`;
  },

  // Generate tracking number
  generateTrackingNumber: () => {
    const random = crypto.randomBytes(6).toString('hex').toUpperCase();
    return `TRK-${random}`;
  },

  // Calculate order total
  calculateOrderTotal: (orderItems) => {
    return orderItems.reduce((total, item) => {
      return total + (parseFloat(item.unitPrice) * item.quantity);
    }, 0);
  },

  // Format currency
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  // Sanitize user object (remove password)
  sanitizeUser: (user) => {
    const { password, ...sanitized } = user;
    return sanitized;
  },

  // Calculate pagination offset
  getPaginationOffset: (page, limit) => {
    return (parseInt(page) - 1) * parseInt(limit);
  },
};

module.exports = helpers;
