const logger = require('../config/logger');

class EmailService {
  constructor() {
    logger.warn('Email service is running in MOCK mode - emails will be logged but not sent');
  }

  async sendEmail(to, subject, html) {
    logger.info(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
    logger.info(`[MOCK EMAIL] Body: ${html}`);
    return true;
  }

  async sendLowStockAlert(product, warehouse, currentStock) {
    logger.info(`[MOCK EMAIL] Low Stock Alert: ${product.name} in ${warehouse.name} - Stock: ${currentStock}`);
    return true;
  }

  async sendOrderConfirmation(vendor, order) {
    logger.info(`[MOCK EMAIL] Order Confirmation sent to ${vendor.email} for order ${order.orderNumber}`);
    return true;
  }

  async sendDeliveryNotification(order, delivery) {
    logger.info(`[MOCK EMAIL] Delivery notification for order ${order.orderNumber}`);
    return true;
  }
}

module.exports = new EmailService();
