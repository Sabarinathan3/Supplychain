const prisma = require('../config/database');
const cacheService = require('./cacheService');
const emailService = require('./emailService');
const { TRANSACTION_TYPE } = require('../utils/constants');

class StockService {
  // Update stock quantity
  async updateStock(inventoryId, quantity, userId, type, reference = null, notes = null) {
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: {
        product: true,
        warehouse: true,
      },
    });

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    const previousQty = inventory.quantity;
    let newQty = previousQty;

    // Calculate new quantity based on transaction type
    switch (type) {
      case TRANSACTION_TYPE.STOCK_IN:
        newQty = previousQty + quantity;
        break;
      case TRANSACTION_TYPE.STOCK_OUT:
        newQty = previousQty - quantity;
        if (newQty < 0) {
          throw new Error('Insufficient stock');
        }
        break;
      case TRANSACTION_TYPE.ADJUSTMENT:
        newQty = quantity;
        break;
      default:
        throw new Error('Invalid transaction type');
    }

    // Update inventory
    const updatedInventory = await prisma.$transaction(async (tx) => {
      // Update inventory quantity
      const updated = await tx.inventory.update({
        where: { id: inventoryId },
        data: {
          quantity: newQty,
          lastRestocked: type === TRANSACTION_TYPE.STOCK_IN ? new Date() : inventory.lastRestocked,
        },
        include: {
          product: true,
          warehouse: true,
        },
      });

      // Create transaction log
      await tx.transaction.create({
        data: {
          inventoryId,
          userId,
          type,
          quantity,
          previousQty,
          newQty,
          reference,
          notes,
        },
      });

      return updated;
    });

    // Clear cache
    await cacheService.del(cacheService.keys.inventory(inventoryId));
    await cacheService.del(cacheService.keys.warehouseInventory(inventory.warehouseId));

    // Check for low stock and send alert
    if (newQty <= inventory.product.reorderLevel) {
      await emailService.sendLowStockAlert(
        inventory.product,
        inventory.warehouse,
        newQty
      );
    }

    return updatedInventory;
  }

  // Get inventory by warehouse
  async getWarehouseInventory(warehouseId) {
    const cacheKey = cacheService.keys.warehouseInventory(warehouseId);
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const inventory = await prisma.inventory.findMany({
      where: { warehouseId },
      include: {
        product: true,
        warehouse: true,
      },
    });

    await cacheService.set(cacheKey, inventory);
    return inventory;
  }

  async getLowStockItems() {
  const cacheKey = cacheService.keys.lowStock();
  const cached = await cacheService.get(cacheKey);

  if (cached) {
    return cached;
  }

  // Get all inventory with products
  const allInventory = await prisma.inventory.findMany({
    include: {
      product: true,
      warehouse: true,
    },
  });

  // Filter low stock items in JavaScript
  const lowStockItems = allInventory.filter(
    item => item.quantity <= item.product.reorderLevel
  );

  await cacheService.set(cacheKey, lowStockItems, 300);
  return lowStockItems;
}


  // Transfer stock between warehouses
  async transferStock(productId, fromWarehouseId, toWarehouseId, quantity, userId) {
    // Find source inventory
    const sourceInventory = await prisma.inventory.findFirst({
      where: {
        productId,
        warehouseId: fromWarehouseId,
      },
    });

    if (!sourceInventory) {
      throw new Error('Source inventory not found');
    }

    if (sourceInventory.quantity < quantity) {
      throw new Error('Insufficient stock in source warehouse');
    }

    // Find or create destination inventory
    let destInventory = await prisma.inventory.findFirst({
      where: {
        productId,
        warehouseId: toWarehouseId,
      },
    });

    const transfer = await prisma.$transaction(async (tx) => {
      // Reduce stock from source
      await tx.inventory.update({
        where: { id: sourceInventory.id },
        data: { quantity: { decrement: quantity } },
      });

      // Log source transaction
      await tx.transaction.create({
        data: {
          inventoryId: sourceInventory.id,
          userId,
          type: TRANSACTION_TYPE.TRANSFER,
          quantity: -quantity,
          previousQty: sourceInventory.quantity,
          newQty: sourceInventory.quantity - quantity,
          notes: `Transfer to warehouse ${toWarehouseId}`,
        },
      });

      // Add stock to destination
      if (destInventory) {
        await tx.inventory.update({
          where: { id: destInventory.id },
          data: { quantity: { increment: quantity } },
        });
      } else {
        destInventory = await tx.inventory.create({
          data: {
            productId,
            warehouseId: toWarehouseId,
            quantity,
          },
        });
      }

      // Log destination transaction
      await tx.transaction.create({
        data: {
          inventoryId: destInventory.id,
          userId,
          type: TRANSACTION_TYPE.TRANSFER,
          quantity,
          previousQty: destInventory.quantity - quantity,
          newQty: destInventory.quantity,
          notes: `Transfer from warehouse ${fromWarehouseId}`,
        },
      });

      // Create transfer record
      return await tx.transfer.create({
        data: {
          productId,
          fromWarehouseId,
          toWarehouseId,
          quantity,
          initiatedBy: userId,
          status: 'completed',
          completedAt: new Date(),
          completedBy: userId,
        },
      });
    });

    // Clear caches
    await cacheService.del(cacheService.keys.warehouseInventory(fromWarehouseId));
    await cacheService.del(cacheService.keys.warehouseInventory(toWarehouseId));

    return transfer;
  }

  // Get transaction history
  async getTransactionHistory(inventoryId, limit = 50) {
    return prisma.transaction.findMany({
      where: { inventoryId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

module.exports = new StockService();
