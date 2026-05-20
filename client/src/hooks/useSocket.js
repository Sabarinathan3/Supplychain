import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (options = {}) => {
  const { autoConnect = true, reconnection = true } = options;
  const { token } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (!token || !autoConnect) return;

    // Create socket instance
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, autoConnect, reconnection]);

  // Emit event
  const emit = useCallback((event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }, [isConnected]);

  // Listen to event
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  // Remove event listener
  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  // Listen to event once
  const once = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.once(event, callback);
    }
  }, []);

  // Manually connect
  const connect = useCallback(() => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    }
  }, [isConnected]);

  // Manually disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.disconnect();
    }
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    emit,
    on,
    off,
    once,
    connect,
    disconnect,
  };
};

// Hook for specific socket events
export const useSocketEvent = (event, callback, dependencies = []) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket, isConnected, event, callback, ...dependencies]);
};

// Hook for inventory updates
export const useInventorySocket = (callback) => {
  const { on, off } = useSocket();

  useEffect(() => {
    const events = [
      'inventory_updated',
      'low_stock_alert',
      'out_of_stock_alert',
    ];

    events.forEach((event) => {
      on(event, callback);
    });

    return () => {
      events.forEach((event) => {
        off(event, callback);
      });
    };
  }, [on, off, callback]);
};

// Hook for order updates
export const useOrderSocket = (callback) => {
  const { on, off } = useSocket();

  useEffect(() => {
    const events = [
      'order_created',
      'order_status_changed',
      'order_cancelled',
    ];

    events.forEach((event) => {
      on(event, callback);
    });

    return () => {
      events.forEach((event) => {
        off(event, callback);
      });
    };
  }, [on, off, callback]);
};

// Hook for transfer updates
export const useTransferSocket = (callback) => {
  const { on, off } = useSocket();

  useEffect(() => {
    const events = [
      'transfer_created',
      'transfer_approved',
      'transfer_rejected',
      'transfer_completed',
    ];

    events.forEach((event) => {
      on(event, callback);
    });

    return () => {
      events.forEach((event) => {
        off(event, callback);
      });
    };
  }, [on, off, callback]);
};

// Hook for delivery updates
export const useDeliverySocket = (callback) => {
  const { on, off } = useSocket();

  useEffect(() => {
    const events = [
      'delivery_update',
      'delivery_status_changed',
    ];

    events.forEach((event) => {
      on(event, callback);
    });

    return () => {
      events.forEach((event) => {
        off(event, callback);
      });
    };
  }, [on, off, callback]);
};

// Hook for notifications
export const useNotificationSocket = (callback) => {
  const { on, off } = useSocket();

  useEffect(() => {
    on('notification', callback);

    return () => {
      off('notification', callback);
    };
  }, [on, off, callback]);
};

export default useSocket;
