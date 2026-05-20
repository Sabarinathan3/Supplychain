const redis = require('../config/redis');
const logger = require('../config/logger');
const { CACHE_TTL } = require('../utils/constants');

class CacheService {
  // Get cached data
  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  // Set cache data
  async set(key, value, ttl = CACHE_TTL.MEDIUM) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  // Delete cache
  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  // Delete multiple keys by pattern
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
      return false;
    }
  }

  // Clear all cache
  async flush() {
    try {
      await redis.flushdb();
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  // Generate cache keys
  keys = {
    inventory: (id) => `inventory:${id}`,
    warehouse: (id) => `warehouse:${id}`,
    product: (id) => `product:${id}`,
    vendor: (id) => `vendor:${id}`,
    order: (id) => `order:${id}`,
    warehouseInventory: (warehouseId) => `warehouse:${warehouseId}:inventory`,
    lowStock: () => 'inventory:low-stock',
    analytics: (type) => `analytics:${type}`,
  };
}

module.exports = new CacheService();
