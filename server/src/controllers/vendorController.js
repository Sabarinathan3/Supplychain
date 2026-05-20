const prisma = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');
const cacheService = require('../services/cacheService');
const { getPaginationOffset } = require('../utils/helpers');
const { PAGINATION } = require('../utils/constants');

const vendorController = {
  // Get all vendors
  getAll: asyncHandler(async (req, res) => {
    const { 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT,
      search,
      isActive 
    } = req.query;
    
    const offset = getPaginationOffset(page, limit);

    const where = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        include: {
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vendor.count({ where }),
    ]);

    ApiResponse.paginated(res, vendors, page, limit, total);
  }),

  // Get vendor by ID
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cacheKey = cacheService.keys.vendor(id);
    
    let vendor = await cacheService.get(cacheKey);

    if (!vendor) {
      vendor = await prisma.vendor.findUnique({
        where: { id },
        include: {
          orders: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              orderItems: {
                include: {
                  product: true,
                },
              },
            },
          },
          _count: {
            select: { orders: true },
          },
        },
      });

      if (!vendor) {
        return ApiResponse.error(res, 'Vendor not found', 404);
      }

      await cacheService.set(cacheKey, vendor);
    }

    ApiResponse.success(res, vendor);
  }),

  // Create vendor
  create: asyncHandler(async (req, res) => {
    const { name, email, phone, address, contactPerson } = req.body;

    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        phone,
        address,
        contactPerson,
      },
    });

    ApiResponse.success(res, vendor, 'Vendor created successfully', 201);
  }),

  // Update vendor
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, contactPerson, isActive } = req.body;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(contactPerson && { contactPerson }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    await cacheService.del(cacheService.keys.vendor(id));

    ApiResponse.success(res, vendor, 'Vendor updated successfully');
  }),

  // Delete vendor
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if vendor has orders
    const orderCount = await prisma.order.count({
      where: { vendorId: id },
    });

    if (orderCount > 0) {
      return ApiResponse.error(
        res,
        'Cannot delete vendor with existing orders',
        400
      );
    }

    await prisma.vendor.delete({
      where: { id },
    });

    await cacheService.del(cacheService.keys.vendor(id));

    ApiResponse.success(res, null, 'Vendor deleted successfully');
  }),

  // Get vendor statistics
  getStats: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    if (!vendor) {
      return ApiResponse.error(res, 'Vendor not found', 404);
    }

    const totalOrders = vendor.orders.length;
    const totalAmount = vendor.orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount),
      0
    );
    const pendingOrders = vendor.orders.filter(
      (order) => order.status === 'PENDING'
    ).length;
    const completedOrders = vendor.orders.filter(
      (order) => order.status === 'DELIVERED'
    ).length;

    const stats = {
      vendorName: vendor.name,
      totalOrders,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      pendingOrders,
      completedOrders,
      averageOrderValue: totalOrders > 0 ? parseFloat((totalAmount / totalOrders).toFixed(2)) : 0,
    };

    ApiResponse.success(res, stats);
  }),

  // Get vendor orders
  getOrders: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT 
    } = req.query;
    
    const offset = getPaginationOffset(page, limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { vendorId: id },
        skip: offset,
        take: parseInt(limit),
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          delivery: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: { vendorId: id } }),
    ]);

    ApiResponse.paginated(res, orders, page, limit, total);
  }),
};

module.exports = vendorController;
