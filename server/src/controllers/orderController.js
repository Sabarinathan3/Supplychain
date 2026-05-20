const prisma = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');
const cacheService = require('../services/cacheService');
const emailService = require('../services/emailService');
const { generateOrderNumber, calculateOrderTotal } = require('../utils/helpers');
const { getPaginationOffset } = require('../utils/helpers');
const { PAGINATION, ORDER_STATUS } = require('../utils/constants');

const orderController = {
  // Get all orders
  getAll: asyncHandler(async (req, res) => {
    const { 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      vendorId 
    } = req.query;
    
    const offset = getPaginationOffset(page, limit);

    const where = {};
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        include: {
          vendor: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: true,
            },
          },
          delivery: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    ApiResponse.paginated(res, orders, page, limit, total);
  }),

  // Get order by ID
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cacheKey = cacheService.keys.order(id);
    
    let order = await cacheService.get(cacheKey);

    if (!order) {
      order = await prisma.order.findUnique({
        where: { id },
        include: {
          vendor: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: true,
            },
          },
          delivery: true,
        },
      });

      if (!order) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      await cacheService.set(cacheKey, order);
    }

    ApiResponse.success(res, order);
  }),

  // Create order
  create: asyncHandler(async (req, res) => {
    const { vendorId, orderItems, expectedDelivery, notes } = req.body;

    // Validate vendor
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return ApiResponse.error(res, 'Vendor not found', 404);
    }

    if (!vendor.isActive) {
      return ApiResponse.error(res, 'Vendor is inactive', 400);
    }

    // Calculate order total
    const totalAmount = calculateOrderTotal(orderItems);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order with order items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        vendorId,
        userId: req.user.id,
        totalAmount,
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
        notes,
        orderItems: {
          create: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        vendor: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Send email to vendor
    await emailService.sendOrderConfirmation(vendor, order);

    ApiResponse.success(res, order, 'Order created successfully', 201);
  }),

  // Update order status
  updateStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(ORDER_STATUS).includes(status)) {
      return ApiResponse.error(res, 'Invalid order status', 400);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        vendor: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        delivery: true,
      },
    });

    await cacheService.del(cacheService.keys.order(id));

    ApiResponse.success(res, order, 'Order status updated successfully');
  }),

  // Update order
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { expectedDelivery, notes, status } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(expectedDelivery && { expectedDelivery: new Date(expectedDelivery) }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
      },
      include: {
        vendor: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        delivery: true,
      },
    });

    await cacheService.del(cacheService.keys.order(id));

    ApiResponse.success(res, order, 'Order updated successfully');
  }),

  // Cancel order
  cancel: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    if (order.status === ORDER_STATUS.DELIVERED) {
      return ApiResponse.error(res, 'Cannot cancel delivered order', 400);
    }

    if (order.status === ORDER_STATUS.CANCELLED) {
      return ApiResponse.error(res, 'Order is already cancelled', 400);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: ORDER_STATUS.CANCELLED,
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
      },
      include: {
        vendor: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    await cacheService.del(cacheService.keys.order(id));

    ApiResponse.success(res, updatedOrder, 'Order cancelled successfully');
  }),

  // Delete order
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        delivery: true,
      },
    });

    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    if (order.status !== ORDER_STATUS.CANCELLED) {
      return ApiResponse.error(
        res,
        'Only cancelled orders can be deleted',
        400
      );
    }

    if (order.delivery) {
      return ApiResponse.error(
        res,
        'Cannot delete order with delivery record',
        400
      );
    }

    await prisma.order.delete({
      where: { id },
    });

    await cacheService.del(cacheService.keys.order(id));

    ApiResponse.success(res, null, 'Order deleted successfully');
  }),

  // Get order statistics
  getStats: asyncHandler(async (req, res) => {
    const totalOrders = await prisma.order.count();
    
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const totalAmount = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: true,
      },
    });

    const stats = {
      totalOrders,
      statusBreakdown: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      totalAmount: parseFloat(totalAmount._sum.totalAmount || 0),
      recentOrders,
    };

    ApiResponse.success(res, stats);
  }),
};

module.exports = orderController;
