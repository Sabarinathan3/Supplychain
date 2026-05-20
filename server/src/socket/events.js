module.exports = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  
  // Inventory events
  INVENTORY_UPDATED: 'inventory_updated',
  LOW_STOCK_ALERT: 'low_stock_alert',
  STOCK_ADDED: 'stock_added',
  STOCK_REMOVED: 'stock_removed',
  
  // Order events
  ORDER_CREATED: 'order_created',
  ORDER_UPDATED: 'order_updated',
  ORDER_STATUS_CHANGED: 'order_status_changed',
  
  // Transfer events
  TRANSFER_CREATED: 'transfer_created',
  TRANSFER_APPROVED: 'transfer_approved',
  TRANSFER_REJECTED: 'transfer_rejected',
  
  // Delivery events
  DELIVERY_CREATED: 'delivery_created',
  DELIVERY_UPDATED: 'delivery_updated',
  DELIVERY_COMPLETED: 'delivery_completed',
  
  // General notifications
  NOTIFICATION: 'notification',
  ERROR: 'error',
};
