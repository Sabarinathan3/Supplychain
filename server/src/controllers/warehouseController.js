const prisma = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');
const cacheService = require('../services/cacheService');
const { getPaginationOffset } = require('../utils/helpers');
const { PAGINATION } = require('../utils/constants');

const warehouseController = {
  // Get all warehouses
  getAll: asyncHandler(async (req, res) => {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = req.query;
    const offset = getPaginationOffset(page, limit);

    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        skip: offset,
        take: parseInt(limit),
        include: {
          _count: {
            select: { inventory: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.warehouse.count(),
    ]);

    ApiResponse.paginated(res, warehouses, page, limit, total);
  }),

  // Get warehouse by ID
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cacheKey = cacheService.keys.warehouse(id);
    
    let warehouse = await cacheService.get(cacheKey);

    if (!warehouse) {
      warehouse = await prisma.warehouse.findUnique({
        where: { id },
        include: {
          inventory: {
            include: {
              product: true,
            },
          },
          _count: {
            select: { inventory: true },
          },
        },
      });

      if (!warehouse) {
        return ApiResponse.error(res, 'Warehouse not found', 404);
      }

      await cacheService.set(cacheKey, warehouse);
    }

    ApiResponse.success(res, warehouse);
  }),

  // Create warehouse
  create: asyncHandler(async (req, res) => {
    const { name, location, address, capacity, managerId } = req.body;

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        location,
        address,
        capacity,
        managerId,
      },
    });

    ApiResponse.success(res, warehouse, 'Warehouse created successfully', 201);
  }),

  // Update warehouse
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, location, address, capacity, managerId, isActive } = req.body;

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(location && { location }),
        ...(address && { address }),
        ...(capacity && { capacity }),
        ...(managerId !== undefined && { managerId }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    await cacheService.del(cacheService.keys.warehouse(id));

    ApiResponse.success(res, warehouse, 'Warehouse updated successfully');
  }),

  // Delete warehouse
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if warehouse has inventory
    const inventoryCount = await prisma.inventory.count({
      where: { warehouseId: id },
    });

    if (inventoryCount > 0) {
      return ApiResponse.error(
        res,
        'Cannot delete warehouse with existing inventory. Please transfer or remove inventory first.',
        400
      );
    }

    await prisma.warehouse.delete({
      where: { id },
    });

    await cacheService.del(cacheService.keys.warehouse(id));

    ApiResponse.success(res, null, 'Warehouse deleted successfully');
  }),

  // Get warehouse statistics
  getStats: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const stats = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!stats) {
      return ApiResponse.error(res, 'Warehouse not found', 404);
    }

    const totalProducts = stats.inventory.length;
    const totalStock = stats.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    const totalValue = stats.inventory.reduce(
      (sum, inv) => sum + inv.quantity * parseFloat(inv.product.unitPrice),
      0
    );
    const lowStockItems = stats.inventory.filter(
      (inv) => inv.quantity <= inv.product.reorderLevel
    ).length;

    const statistics = {
      warehouseName: stats.name,
      totalProducts,
      totalStock,
      totalValue: parseFloat(totalValue.toFixed(2)),
      lowStockItems,
      capacity: stats.capacity,
      utilizationPercentage: ((totalStock / stats.capacity) * 100).toFixed(2),
    };

    ApiResponse.success(res, statistics);
  }),
};

module.exports = warehouseController;
