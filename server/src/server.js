const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const SocketHandler = require('./socket/socketHandler');
const logger = require('./config/logger');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Initialize socket handlers
const socketHandler = new SocketHandler(io);
socketHandler.initialize();

// Add this after initializing socketHandler in src/server.js
const notificationService = require('./services/notificationService');
notificationService.setSocketHandler(socketHandler);

// Make socketHandler available globally
global.socketHandler = socketHandler;

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);
  
  // Close server
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Close database connections
    const prisma = require('./config/database');
    await prisma.$disconnect();
    logger.info('Database disconnected');
    
    // Close Redis connection
    const redis = require('./config/redis');
    redis.disconnect();
    logger.info('Redis disconnected');
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start server
server.listen(PORT, () => {
  logger.info('=================================');
  logger.info('Enterprise Inventory System API');
  logger.info('=================================');
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API: http://localhost:${PORT}/api`);
  logger.info(`💚 Health: http://localhost:${PORT}/health`);
  logger.info(`📖 Docs: http://localhost:${PORT}/api/docs`);
  logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
  logger.info('=================================');
});

module.exports = { server, io };
