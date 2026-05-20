import { io } from 'socket.io-client';
import store from '../redux/store';
import { addNotification } from '../redux/slices/notificationSlice';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('notification', (data) => {
      store.dispatch(
        addNotification({
          id: Date.now().toString(),
          ...data,
          read: false,
          timestamp: new Date().toISOString(), // Changed from new Date()
        })
      );
    });

    this.socket.on('low_stock_alert', (data) => {
      store.dispatch(
        addNotification({
          id: Date.now().toString(),
          type: 'warning',
          title: 'Low Stock Alert',
          message: `${data.product.name} is running low in ${data.warehouse.name}`,
          data,
          read: false,
          timestamp: new Date().toISOString(), // Changed from new Date()
        })
      );
    });

    this.socket.on('inventory_updated', (data) => {
      // Handle inventory updates
      console.log('Inventory updated:', data);
    });

    this.socket.on('order_created', (data) => {
      store.dispatch(
        addNotification({
          id: Date.now().toString(),
          type: 'info',
          title: 'New Order Created',
          message: `Order ${data.orderNumber} has been created`,
          data,
          read: false,
          timestamp: new Date().toISOString(), // Changed from new Date()
        })
      );
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
}

export default new SocketService();
