const prisma = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');
const stockService = require('../services/stockService');
const cacheService = require('../services/cacheService');
const { TRANSACTION_TYPE } = require('../utils/constants');
const { getPaginationOffset } = require('../utils/helpers');
const { PAGINATION } = require('../utils/constants');

const inventoryController = {
  // Get all inventory
  getAll: asyncHandler(async (req, res) => {
    const { 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT,
      warehouseId,
      productId 
    } = req.query;
    
    const offset = getPaginationOffset(page, limit);

    const where = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;

    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        include: {
          product: true,
          warehouse: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.inventory.count({ where }),
    ]);

    ApiResponse.paginated(res, inventory, page, limit, total);
  }),

  // Get inventory by ID
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cacheKey = cacheService.keys.inventory(id);
    
    let inventory = await cacheService.get(cacheKey);

    if (!inventory) {
      inventory = await prisma.inventory.findUnique({
        where: { id },
        include: {
          product: true,
          warehouse: true,
          transactions: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (!inventory) {
        return ApiResponse.error(res, 'Inventory not found', 404);
      }

      await cacheService.set(cacheKey, inventory);
    }

    ApiResponse.success(res, inventory);
  }),

  // Add inventory (stock in)
  addStock: asyncHandler(async (req, res) => {
    const { productId, warehouseId, quantity, notes } = req.body;

    // Find or create inventory
    let inventory = await prisma.inventory.findFirst({
      where: {
        productId,
        warehouseId,
      },
    });

    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: {
          productId,
          warehouseId,
          quantity: 0,
        },
      });
    }

    const updatedInventory = await stockService.updateStock(
      inventory.id,
      quantity,
      req.user.id,
      TRANSACTION_TYPE.STOCK_IN,
      null,
      notes
    );

    ApiResponse.success(res, updatedInventory, 'Stock added successfully', 201);
  }),

  // Remove inventory (stock out)
  removeStock: asyncHandler(async (req, res) => {
    const { inventoryId, quantity, notes } = req.body;

    const updatedInventory = await stockService.updateStock(
      inventoryId,
      quantity,
      req.user.id,
      TRANSACTION_TYPE.STOCK_OUT,
      null,
      notes
    );

    ApiResponse.success(res, updatedInventory, 'Stock removed successfully');
  }),

  // Adjust inventory
  adjustStock: asyncHandler(async (req, res) => {
    const { inventoryId, quantity, notes } = req.body;

    const updatedInventory = await stockService.updateStock(
      inventoryId,
      quantity,
      req.user.id,
      TRANSACTION_TYPE.ADJUSTMENT,
      null,
      notes
    );

    ApiResponse.success(res, updatedInventory, 'Stock adjusted successfully');
  }),

  // Transfer stock between warehouses
  transferStock: asyncHandler(async (req, res) => {
    const { productId, fromWarehouseId, toWarehouseId, quantity } = req.body;

    const transfer = await stockService.transferStock(
      productId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      req.user.id
    );

    ApiResponse.success(res, transfer, 'Stock transferred successfully');
  }),

  // Get warehouse inventory
  getWarehouseInventory: asyncHandler(async (req, res) => {
    const { warehouseId } = req.params;

    const inventory = await stockService.getWarehouseInventory(warehouseId);

    ApiResponse.success(res, inventory);
  }),

  // Get low stock items
  getLowStock: asyncHandler(async (req, res) => {
    const lowStockItems = await stockService.getLowStockItems();

    ApiResponse.success(res, lowStockItems);
  }),

  // Scan product (QR/Barcode)
  scanProduct: asyncHandler(async (req, res) => {
    const { code, warehouseId } = req.body;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: code },
          { qrCode: code },
          { barcode: code },
        ],
      },
    });

    if (!product) {
      return ApiResponse.error(res, 'Product not found', 404);
    }

    const inventory = await prisma.inventory.findFirst({
      where: {
        productId: product.id,
        warehouseId,
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    ApiResponse.success(res, { product, inventory });
  }),

  // Get transaction history
  getTransactionHistory: asyncHandler(async (req, res) => {
    const { inventoryId } = req.params;
    const { limit = 50 } = req.query;

    const transactions = await stockService.getTransactionHistory(
      inventoryId,
      parseInt(limit)
    );

    ApiResponse.success(res, transactions);
  }),

  // Delete inventory
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!inventory) {
      return ApiResponse.error(res, 'Inventory not found', 404);
    }

    if (inventory.quantity > 0) {
      return ApiResponse.error(
        res,
        'Cannot delete inventory with existing stock. Please remove stock first.',
        400
      );
    }

    await prisma.inventory.delete({
      where: { id },
    });

    await cacheService.del(cacheService.keys.inventory(id));

    ApiResponse.success(res, null, 'Inventory deleted successfully');
  }),
};

module.exports = inventoryController;
