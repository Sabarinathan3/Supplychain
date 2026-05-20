const prisma = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');
const emailService = require('../services/emailService');
const { generateTrackingNumber } = require('../utils/helpers');
const { ORDER_STATUS } = require('../utils/constants');

const deliveryController = {
  // Get all deliveries
  getAll: asyncHandler(async (req, res) => {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const deliveries = await prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            vendor: true,
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    ApiResponse.success(res, deliveries);
  }),

  // Get delivery by ID
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            vendor: true,
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!delivery) {
      return ApiResponse.error(res, 'Delivery not found', 404);
    }

    ApiResponse.success(res, delivery);
  }),

  // Get delivery by order ID
  getByOrderId: asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const delivery = await prisma.delivery.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            vendor: true,
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!delivery) {
      return ApiResponse.error(res, 'Delivery not found', 404);
    }

    ApiResponse.success(res, delivery);
  }),

  // Create delivery
  create: asyncHandler(async (req, res) => {
    const { orderId, deliveredBy, notes } = req.body;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        vendor: true,
      },
    });

    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Check if delivery already exists
    const existingDelivery = await prisma.delivery.findUnique({
      where: { orderId },
    });

    if (existingDelivery) {
      return ApiResponse.error(res, 'Delivery already exists for this order', 400);
    }

    // Generate tracking number
    const trackingNumber = generateTrackingNumber();

    // Create delivery and update order status
    const delivery = await prisma.$transaction(async (tx) => {
      const newDelivery = await tx.delivery.create({
        data: {
          orderId,
          trackingNumber,
          deliveredBy,
          notes,
          status: 'pending',
        },
        include: {
          order: {
            include: {
              vendor: true,
            },
          },
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: ORDER_STATUS.SHIPPED },
      });

      return newDelivery;
    });

    ApiResponse.success(res, delivery, 'Delivery created successfully', 201);
  }),

  // Update delivery
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, deliveredBy, receivedBy, deliveryDate, notes } = req.body;

    const delivery = await prisma.delivery.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(deliveredBy && { deliveredBy }),
        ...(receivedBy && { receivedBy }),
        ...(deliveryDate && { deliveryDate: new Date(deliveryDate) }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        order: {
          include: {
            vendor: true,
          },
        },
      },
    });

    ApiResponse.success(res, delivery, 'Delivery updated successfully');
  }),

  // Complete delivery
  complete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { receivedBy } = req.body;

    const delivery = await prisma.$transaction(async (tx) => {
      const completedDelivery = await tx.delivery.update({
        where: { id },
        data: {
          status: 'delivered',
          deliveryDate: new Date(),
          receivedBy,
        },
        include: {
          order: {
            include: {
              vendor: true,
              orderItems: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      // Update order status to delivered
      await tx.order.update({
        where: { id: completedDelivery.orderId },
        data: { status: ORDER_STATUS.DELIVERED },
      });

      return completedDelivery;
    });

    // Send delivery notification
    await emailService.sendDeliveryNotification(delivery.order, delivery);

    ApiResponse.success(res, delivery, 'Delivery completed successfully');
  }),

  // Track delivery by tracking number
  track: asyncHandler(async (req, res) => {
    const { trackingNumber } = req.params;

    const delivery = await prisma.delivery.findUnique({
      where: { trackingNumber },
      include: {
        order: {
          include: {
            vendor: true,
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!delivery) {
      return ApiResponse.error(res, 'Delivery not found', 404);
    }

    ApiResponse.success(res, delivery);
  }),

  // Delete delivery
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
    });

    if (!delivery) {
      return ApiResponse.error(res, 'Delivery not found', 404);
    }

    if (delivery.status === 'delivered') {
      return ApiResponse.error(res, 'Cannot delete completed delivery', 400);
    }

    await prisma.delivery.delete({
      where: { id },
    });

    ApiResponse.success(res, null, 'Delivery deleted successfully');
  }),
};

module.exports = deliveryController;
