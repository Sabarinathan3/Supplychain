const prisma = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');
const stockService = require('../services/stockService');
const cacheService = require('../services/cacheService');
const { getPaginationOffset } = require('../utils/helpers');
const { PAGINATION } = require('../utils/constants');

const transferController = {
  // Get all transfers
  getAll: asyncHandler(async (req, res) => {
    const { 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      fromWarehouseId,
      toWarehouseId 
    } = req.query;
    
    const offset = getPaginationOffset(page, limit);

    const where = {};
    if (status) where.status = status;
    if (fromWarehouseId) where.fromWarehouseId = fromWarehouseId;
    if (toWarehouseId) where.toWarehouseId = toWarehouseId;

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        include: {
          fromWarehouse: true,
          toWarehouse: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transfer.count({ where }),
    ]);

    // Get product details for each transfer
    const transfersWithProducts = await Promise.all(
      transfers.map(async (transfer) => {
        const product = await prisma.product.findUnique({
          where: { id: transfer.productId },
        });
        return {
          ...transfer,
          product,
        };
      })
    );

    ApiResponse.paginated(res, transfersWithProducts, page, limit, total);
  }),

  // Get transfer by ID
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
      },
    });

    if (!transfer) {
      return ApiResponse.error(res, 'Transfer not found', 404);
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: transfer.productId },
    });

    // Get initiator and completer details
    const [initiator, completer] = await Promise.all([
      prisma.user.findUnique({
        where: { id: transfer.initiatedBy },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      }),
      transfer.completedBy ? prisma.user.findUnique({
        where: { id: transfer.completedBy },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      }) : null,
    ]);

    ApiResponse.success(res, {
      ...transfer,
      product,
      initiator,
      completer,
    });
  }),

  // Create transfer request
  create: asyncHandler(async (req, res) => {
    const { productId, fromWarehouseId, toWarehouseId, quantity } = req.body;

    // Validate warehouses are different
    if (fromWarehouseId === toWarehouseId) {
      return ApiResponse.error(res, 'Source and destination warehouses must be different', 400);
    }

    // Check if warehouses exist
    const [fromWarehouse, toWarehouse] = await Promise.all([
      prisma.warehouse.findUnique({ where: { id: fromWarehouseId } }),
      prisma.warehouse.findUnique({ where: { id: toWarehouseId } }),
    ]);

    if (!fromWarehouse) {
      return ApiResponse.error(res, 'Source warehouse not found', 404);
    }

    if (!toWarehouse) {
      return ApiResponse.error(res, 'Destination warehouse not found', 404);
    }

    if (!fromWarehouse.isActive || !toWarehouse.isActive) {
      return ApiResponse.error(res, 'One or both warehouses are inactive', 400);
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return ApiResponse.error(res, 'Product not found', 404);
    }

    // Check source inventory
    const sourceInventory = await prisma.inventory.findFirst({
      where: {
        productId,
        warehouseId: fromWarehouseId,
      },
    });

    if (!sourceInventory) {
      return ApiResponse.error(res, 'Product not found in source warehouse', 404);
    }

    if (sourceInventory.quantity < quantity) {
      return ApiResponse.error(
        res,
        `Insufficient stock. Available: ${sourceInventory.quantity}, Requested: ${quantity}`,
        400
      );
    }

    // Create transfer record
    const transfer = await prisma.transfer.create({
      data: {
        productId,
        fromWarehouseId,
        toWarehouseId,
        quantity,
        initiatedBy: req.user.id,
        status: 'pending',
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
      },
    });

    ApiResponse.success(res, {
      ...transfer,
      product,
    }, 'Transfer request created successfully', 201);
  }),

  // Approve and execute transfer
  approve: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const transfer = await prisma.transfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      return ApiResponse.error(res, 'Transfer not found', 404);
    }

    if (transfer.status !== 'pending') {
      return ApiResponse.error(res, `Transfer is already ${transfer.status}`, 400);
    }

    // Execute the stock transfer
    try {
      const executedTransfer = await stockService.transferStock(
        transfer.productId,
        transfer.fromWarehouseId,
        transfer.toWarehouseId,
        transfer.quantity,
        req.user.id
      );

      // Update transfer status
      const updatedTransfer = await prisma.transfer.update({
        where: { id },
        data: {
          status: 'completed',
          completedBy: req.user.id,
          completedAt: new Date(),
        },
        include: {
          fromWarehouse: true,
          toWarehouse: true,
        },
      });

      // Get product details
      const product = await prisma.product.findUnique({
        where: { id: transfer.productId },
      });

      ApiResponse.success(res, {
        ...updatedTransfer,
        product,
      }, 'Transfer approved and executed successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }),

  // Reject transfer
  reject: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const transfer = await prisma.transfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      return ApiResponse.error(res, 'Transfer not found', 404);
    }

    if (transfer.status !== 'pending') {
      return ApiResponse.error(res, `Transfer is already ${transfer.status}`, 400);
    }

    const updatedTransfer = await prisma.transfer.update({
      where: { id },
      data: {
        status: 'rejected',
        completedBy: req.user.id,
        completedAt: new Date(),
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
      },
    });

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: transfer.productId },
    });

    ApiResponse.success(res, {
      ...updatedTransfer,
      product,
      rejectionReason: reason,
    }, 'Transfer rejected successfully');
  }),

  // Cancel pending transfer
  cancel: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const transfer = await prisma.transfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      return ApiResponse.error(res, 'Transfer not found', 404);
    }

    if (transfer.status !== 'pending') {
      return ApiResponse.error(res, `Cannot cancel ${transfer.status} transfer`, 400);
    }

    // Only initiator or admin can cancel
    if (transfer.initiatedBy !== req.user.id && req.user.role !== 'ADMIN') {
      return ApiResponse.error(res, 'Only the initiator or admin can cancel this transfer', 403);
    }

    const updatedTransfer = await prisma.transfer.update({
      where: { id },
      data: {
        status: 'cancelled',
        completedBy: req.user.id,
        completedAt: new Date(),
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
      },
    });

    ApiResponse.success(res, updatedTransfer, 'Transfer cancelled successfully');
  }),

  // Get transfers by warehouse
  getByWarehouse: asyncHandler(async (req, res) => {
    const { warehouseId } = req.params;
    const { type = 'all' } = req.query; // 'all', 'incoming', 'outgoing'

    const where = {};

    if (type === 'incoming') {
      where.toWarehouseId = warehouseId;
    } else if (type === 'outgoing') {
      where.fromWarehouseId = warehouseId;
    } else {
      where.OR = [
        { fromWarehouseId: warehouseId },
        { toWarehouseId: warehouseId },
      ];
    }

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        fromWarehouse: true,
        toWarehouse: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get product details for each transfer
    const transfersWithProducts = await Promise.all(
      transfers.map(async (transfer) => {
        const product = await prisma.product.findUnique({
          where: { id: transfer.productId },
        });
        return {
          ...transfer,
          product,
        };
      })
    );

    ApiResponse.success(res, transfersWithProducts);
  }),

  // Get pending transfers
  getPending: asyncHandler(async (req, res) => {
    const transfers = await prisma.transfer.findMany({
      where: { status: 'pending' },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get product details for each transfer
    const transfersWithProducts = await Promise.all(
      transfers.map(async (transfer) => {
        const product = await prisma.product.findUnique({
          where: { id: transfer.productId },
        });
        const initiator = await prisma.user.findUnique({
          where: { id: transfer.initiatedBy },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        });
        return {
          ...transfer,
          product,
          initiator,
        };
      })
    );

    ApiResponse.success(res, transfersWithProducts);
  }),

  // Get transfer statistics
  getStats: asyncHandler(async (req, res) => {
    const { warehouseId } = req.query;

    const where = warehouseId ? {
      OR: [
        { fromWarehouseId: warehouseId },
        { toWarehouseId: warehouseId },
      ],
    } : {};

    const [
      totalTransfers,
      pendingTransfers,
      completedTransfers,
      rejectedTransfers,
      cancelledTransfers,
    ] = await Promise.all([
      prisma.transfer.count({ where }),
      prisma.transfer.count({ where: { ...where, status: 'pending' } }),
      prisma.transfer.count({ where: { ...where, status: 'completed' } }),
      prisma.transfer.count({ where: { ...where, status: 'rejected' } }),
      prisma.transfer.count({ where: { ...where, status: 'cancelled' } }),
    ]);

    const stats = {
      totalTransfers,
      statusBreakdown: {
        pending: pendingTransfers,
        completed: completedTransfers,
        rejected: rejectedTransfers,
        cancelled: cancelledTransfers,
      },
      completionRate: totalTransfers > 0 
        ? ((completedTransfers / totalTransfers) * 100).toFixed(2) 
        : 0,
    };

    ApiResponse.success(res, stats);
  }),

  // Delete transfer (only cancelled or rejected)
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const transfer = await prisma.transfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      return ApiResponse.error(res, 'Transfer not found', 404);
    }

    if (!['cancelled', 'rejected'].includes(transfer.status)) {
      return ApiResponse.error(
        res,
        'Only cancelled or rejected transfers can be deleted',
        400
      );
    }

    await prisma.transfer.delete({
      where: { id },
    });

    ApiResponse.success(res, null, 'Transfer deleted successfully');
  }),
};

module.exports = transferController;
