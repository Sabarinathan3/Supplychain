const emailService = require('./emailService');
const logger = require('../config/logger');

class NotificationService {
  constructor() {
    this.socketHandler = null;
  }

  // Set socket handler reference
  setSocketHandler(handler) {
    this.socketHandler = handler;
  }

  // Send notification via multiple channels
  async sendNotification(notification) {
    const { userId, role, type, title, message, data, channels = ['socket', 'email'] } = notification;

    try {
      // Send via Socket.io
      if (channels.includes('socket') && this.socketHandler) {
        if (userId) {
          this.socketHandler.sendNotificationToUser(userId, {
            type,
            title,
            message,
            data,
            timestamp: new Date(),
          });
        } else if (role) {
          this.socketHandler.sendNotificationToRole(role, {
            type,
            title,
            message,
            data,
            timestamp: new Date(),
          });
        }
      }

      // Send via Email
      if (channels.includes('email') && userId) {
        await this.sendEmailNotification(userId, title, message, data);
      }

      logger.info(`Notification sent: ${title}`);
      return true;
    } catch (error) {
      logger.error('Error sending notification:', error);
      return false;
    }
  }

  // Send email notification
  async sendEmailNotification(userId, title, message, data) {
    try {
      const prisma = require('../config/database');
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true },
      });

      if (!user) {
        logger.warn(`User not found for notification: ${userId}`);
        return false;
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${title}</h2>
          <p>Hello ${user.firstName},</p>
          <p>${message}</p>
          ${data ? `<div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <pre style="margin: 0; white-space: pre-wrap;">${JSON.stringify(data, null, 2)}</pre>
          </div>` : ''}
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated notification from the Inventory Management System.
          </p>
        </div>
      `;

      await emailService.sendEmail(user.email, title, html);
      return true;
    } catch (error) {
      logger.error('Error sending email notification:', error);
      return false;
    }
  }

  // Inventory notifications
  async notifyLowStock(inventory) {
    await this.sendNotification({
      role: 'ADMIN',
      type: 'warning',
      title: 'Low Stock Alert',
      message: `${inventory.product.name} is running low in ${inventory.warehouse.name}. Current stock: ${inventory.quantity}`,
      data: {
        productId: inventory.productId,
        warehouseId: inventory.warehouseId,
        currentStock: inventory.quantity,
        reorderLevel: inventory.product.reorderLevel,
      },
      channels: ['socket', 'email'],
    });

    await this.sendNotification({
      role: 'WAREHOUSE_MANAGER',
      type: 'warning',
      title: 'Low Stock Alert',
      message: `${inventory.product.name} is running low in ${inventory.warehouse.name}. Current stock: ${inventory.quantity}`,
      data: {
        productId: inventory.productId,
        warehouseId: inventory.warehouseId,
        currentStock: inventory.quantity,
        reorderLevel: inventory.product.reorderLevel,
      },
      channels: ['socket'],
    });

    if (this.socketHandler) {
      this.socketHandler.broadcastLowStockAlert(inventory);
    }
  }

  async notifyStockAdded(inventory, quantity, userId) {
    await this.sendNotification({
      userId,
      type: 'success',
      title: 'Stock Added Successfully',
      message: `${quantity} units of ${inventory.product.name} added to ${inventory.warehouse.name}`,
      data: {
        productId: inventory.productId,
        warehouseId: inventory.warehouseId,
        quantity,
        newStock: inventory.quantity,
      },
      channels: ['socket'],
    });
  }

  async notifyStockUpdated(inventory) {
    if (this.socketHandler) {
      this.socketHandler.broadcastInventoryUpdate(inventory);
    }
  }

  // Order notifications
  async notifyOrderCreated(order) {
    // Notify order creator
    await this.sendNotification({
      userId: order.userId,
      type: 'success',
      title: 'Order Created',
      message: `Order ${order.orderNumber} has been created successfully for ${order.vendor.name}`,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      },
      channels: ['socket', 'email'],
    });

    // Notify admins
    await this.sendNotification({
      role: 'ADMIN',
      type: 'info',
      title: 'New Order Created',
      message: `New order ${order.orderNumber} created for vendor ${order.vendor.name}`,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        vendorName: order.vendor.name,
        totalAmount: order.totalAmount,
      },
      channels: ['socket'],
    });

    if (this.socketHandler) {
      this.socketHandler.broadcastOrderCreated(order);
    }
  }

  async notifyOrderStatusChanged(order, oldStatus) {
    // Notify order creator
    await this.sendNotification({
      userId: order.userId,
      type: 'info',
      title: 'Order Status Updated',
      message: `Order ${order.orderNumber} status changed from ${oldStatus} to ${order.status}`,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        oldStatus,
        newStatus: order.status,
      },
      channels: ['socket', 'email'],
    });

    if (this.socketHandler) {
      this.socketHandler.broadcastOrderStatusChanged(order);
    }
  }

  // Transfer notifications
  async notifyTransferCreated(transfer, product) {
    await this.sendNotification({
      userId: transfer.initiatedBy,
      type: 'success',
      title: 'Transfer Request Created',
      message: `Transfer request for ${transfer.quantity} units of ${product.name} has been created`,
      data: {
        transferId: transfer.id,
        productName: product.name,
        quantity: transfer.quantity,
        fromWarehouse: transfer.fromWarehouse.name,
        toWarehouse: transfer.toWarehouse.name,
      },
      channels: ['socket'],
    });

    // Notify admins
    await this.sendNotification({
      role: 'ADMIN',
      type: 'info',
      title: 'New Transfer Request',
      message: `Transfer request pending approval: ${product.name} from ${transfer.fromWarehouse.name} to ${transfer.toWarehouse.name}`,
      data: {
        transferId: transfer.id,
        productName: product.name,
        quantity: transfer.quantity,
      },
      channels: ['socket'],
    });

    if (this.socketHandler) {
      this.socketHandler.broadcastTransferCreated(transfer);
    }
  }

  async notifyTransferApproved(transfer, product) {
    await this.sendNotification({
      userId: transfer.initiatedBy,
      type: 'success',
      title: 'Transfer Approved',
      message: `Transfer of ${transfer.quantity} units of ${product.name} has been approved and completed`,
      data: {
        transferId: transfer.id,
        productName: product.name,
        quantity: transfer.quantity,
        fromWarehouse: transfer.fromWarehouse.name,
        toWarehouse: transfer.toWarehouse.name,
      },
      channels: ['socket', 'email'],
    });

    if (this.socketHandler) {
      this.socketHandler.broadcastTransferApproved(transfer);
    }
  }

  async notifyTransferRejected(transfer, product, reason) {
    await this.sendNotification({
      userId: transfer.initiatedBy,
      type: 'error',
      title: 'Transfer Rejected',
      message: `Transfer of ${transfer.quantity} units of ${product.name} has been rejected. Reason: ${reason || 'Not specified'}`,
      data: {
        transferId: transfer.id,
        productName: product.name,
        quantity: transfer.quantity,
        reason,
      },
      channels: ['socket', 'email'],
    });
  }

  // Delivery notifications
  async notifyDeliveryCreated(delivery, order) {
    await this.sendNotification({
      userId: order.userId,
      type: 'info',
      title: 'Delivery Scheduled',
      message: `Delivery has been scheduled for order ${order.orderNumber}. Tracking: ${delivery.trackingNumber}`,
      data: {
        deliveryId: delivery.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        trackingNumber: delivery.trackingNumber,
      },
      channels: ['socket', 'email'],
    });

    if (this.socketHandler) {
      this.socketHandler.broadcastDeliveryUpdate(delivery);
    }
  }

  async notifyDeliveryCompleted(delivery, order) {
    await this.sendNotification({
      userId: order.userId,
      type: 'success',
      title: 'Delivery Completed',
      message: `Order ${order.orderNumber} has been delivered successfully`,
      data: {
        deliveryId: delivery.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        deliveryDate: delivery.deliveryDate,
      },
      channels: ['socket', 'email'],
    });

    // Notify admins
    await this.sendNotification({
      role: 'ADMIN',
      type: 'success',
      title: 'Delivery Completed',
      message: `Order ${order.orderNumber} delivered successfully`,
      data: {
        orderNumber: order.orderNumber,
        deliveryDate: delivery.deliveryDate,
      },
      channels: ['socket'],
    });

    if (this.socketHandler) {
      this.socketHandler.broadcastDeliveryUpdate(delivery);
    }
  }

  // User notifications
  async notifyUserCreated(user) {
    await this.sendNotification({
      userId: user.id,
      type: 'success',
      title: 'Welcome to Inventory System',
      message: `Your account has been created successfully. Role: ${user.role}`,
      data: {
        userId: user.id,
        role: user.role,
      },
      channels: ['email'],
    });
  }

  async notifyUserDeactivated(user) {
    await this.sendNotification({
      userId: user.id,
      type: 'warning',
      title: 'Account Deactivated',
      message: 'Your account has been deactivated. Please contact the administrator for more information.',
      channels: ['email'],
    });
  }

  async notifyPasswordChanged(userId) {
    await this.sendNotification({
      userId,
      type: 'info',
      title: 'Password Changed',
      message: 'Your password has been changed successfully. If you did not make this change, please contact support immediately.',
      channels: ['socket', 'email'],
    });
  }

  // System notifications
  async notifySystemAlert(title, message, severity = 'info') {
    await this.sendNotification({
      role: 'ADMIN',
      type: severity,
      title,
      message,
      channels: ['socket', 'email'],
    });
  }

  async broadcastSystemMaintenance(scheduledTime, duration) {
    if (this.socketHandler) {
      this.socketHandler.broadcastNotification({
        type: 'warning',
        title: 'Scheduled Maintenance',
        message: `System maintenance scheduled for ${scheduledTime}. Expected duration: ${duration} minutes.`,
        timestamp: new Date(),
      });
    }
  }
}

module.exports = new NotificationService();
