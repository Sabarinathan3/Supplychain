const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const logger = require('../config/logger');
const EVENTS = require('./events');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.users = new Map(); // Store connected users
  }

  // Initialize socket handlers
  initialize() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        });

        if (!user || !user.isActive) {
          return next(new Error('Authentication error'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    // Connection handler
    this.io.on(EVENTS.CONNECTION, (socket) => {
      this.handleConnection(socket);
    });

    logger.info('Socket.io handlers initialized');
  }

  // Handle new connection
  handleConnection(socket) {
    const user = socket.user;
    this.users.set(socket.id, user);

    logger.info(`User connected: ${user.email} (${socket.id})`);

    // Join user's personal room
    socket.join(`user:${user.id}`);

    // Join role-based room
    socket.join(`role:${user.role}`);

    // Send connection confirmation
    socket.emit(EVENTS.NOTIFICATION, {
      type: 'success',
      message: 'Connected to real-time updates',
    });

    // Handle room joining
    socket.on(EVENTS.JOIN_ROOM, (room) => {
      this.handleJoinRoom(socket, room);
    });

    // Handle room leaving
    socket.on(EVENTS.LEAVE_ROOM, (room) => {
      this.handleLeaveRoom(socket, room);
    });

    // Handle disconnection
    socket.on(EVENTS.DISCONNECT, () => {
      this.handleDisconnection(socket);
    });
  }

  // Handle joining a room
  handleJoinRoom(socket, room) {
    socket.join(room);
    logger.info(`User ${socket.user.email} joined room: ${room}`);
    socket.emit(EVENTS.NOTIFICATION, {
      type: 'info',
      message: `Joined room: ${room}`,
    });
  }

  // Handle leaving a room
  handleLeaveRoom(socket, room) {
    socket.leave(room);
    logger.info(`User ${socket.user.email} left room: ${room}`);
  }

  // Handle disconnection
  handleDisconnection(socket) {
    const user = this.users.get(socket.id);
    if (user) {
      logger.info(`User disconnected: ${user.email} (${socket.id})`);
      this.users.delete(socket.id);
    }
  }

  // Broadcast inventory update
  broadcastInventoryUpdate(inventory) {
    this.io.to(`warehouse:${inventory.warehouseId}`).emit(EVENTS.INVENTORY_UPDATED, inventory);
    this.io.to('role:ADMIN').emit(EVENTS.INVENTORY_UPDATED, inventory);
    this.io.to('role:WAREHOUSE_MANAGER').emit(EVENTS.INVENTORY_UPDATED, inventory);
  }

  // Broadcast low stock alert
  broadcastLowStockAlert(inventory) {
    this.io.to('role:ADMIN').emit(EVENTS.LOW_STOCK_ALERT, {
      type: 'warning',
      message: `Low stock alert: ${inventory.product.name}`,
      data: inventory,
    });
    this.io.to('role:WAREHOUSE_MANAGER').emit(EVENTS.LOW_STOCK_ALERT, {
      type: 'warning',
      message: `Low stock alert: ${inventory.product.name}`,
      data: inventory,
    });
  }

  // Broadcast order created
  broadcastOrderCreated(order) {
    this.io.to('role:ADMIN').emit(EVENTS.ORDER_CREATED, order);
    this.io.to('role:WAREHOUSE_MANAGER').emit(EVENTS.ORDER_CREATED, order);
    this.io.to(`user:${order.userId}`).emit(EVENTS.ORDER_CREATED, order);
  }

  // Broadcast order status change
  broadcastOrderStatusChanged(order) {
    this.io.to('role:ADMIN').emit(EVENTS.ORDER_STATUS_CHANGED, order);
    this.io.to('role:WAREHOUSE_MANAGER').emit(EVENTS.ORDER_STATUS_CHANGED, order);
    this.io.to(`user:${order.userId}`).emit(EVENTS.ORDER_STATUS_CHANGED, order);
  }

  // Broadcast transfer created
  broadcastTransferCreated(transfer) {
    this.io.to(`warehouse:${transfer.fromWarehouseId}`).emit(EVENTS.TRANSFER_CREATED, transfer);
    this.io.to(`warehouse:${transfer.toWarehouseId}`).emit(EVENTS.TRANSFER_CREATED, transfer);
    this.io.to('role:ADMIN').emit(EVENTS.TRANSFER_CREATED, transfer);
  }

  // Broadcast transfer approved
  broadcastTransferApproved(transfer) {
    this.io.to(`warehouse:${transfer.fromWarehouseId}`).emit(EVENTS.TRANSFER_APPROVED, transfer);
    this.io.to(`warehouse:${transfer.toWarehouseId}`).emit(EVENTS.TRANSFER_APPROVED, transfer);
    this.io.to(`user:${transfer.initiatedBy}`).emit(EVENTS.TRANSFER_APPROVED, transfer);
  }

  // Broadcast delivery update
  broadcastDeliveryUpdate(delivery) {
    this.io.to('role:ADMIN').emit(EVENTS.DELIVERY_UPDATED, delivery);
    this.io.to('role:WAREHOUSE_MANAGER').emit(EVENTS.DELIVERY_UPDATED, delivery);
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    this.io.to(`user:${userId}`).emit(EVENTS.NOTIFICATION, notification);
  }

  // Send notification to role
  sendNotificationToRole(role, notification) {
    this.io.to(`role:${role}`).emit(EVENTS.NOTIFICATION, notification);
  }

  // Broadcast general notification
  broadcastNotification(notification) {
    this.io.emit(EVENTS.NOTIFICATION, notification);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.users.size;
  }

  // Get connected users
  getConnectedUsers() {
    return Array.from(this.users.values());
  }
}

module.exports = SocketHandler;
