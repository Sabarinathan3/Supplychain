const prisma = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');
const cacheService = require('../services/cacheService');
const { CACHE_TTL } = require('../utils/constants');

const analyticsController = {
  // Dashboard overview
getDashboard: asyncHandler(async (req, res) => {
  const cacheKey = cacheService.keys.analytics('dashboard');
  let dashboard = await cacheService.get(cacheKey);

  if (!dashboard) {
    const [
      totalProducts,
      totalWarehouses,
      totalVendors,
      totalOrders,
      lowStockCountResult,
      inventoryData,
      ordersByStatus,
      recentTransactions,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.warehouse.count(),
      prisma.vendor.count({ where: { isActive: true } }),
      prisma.order.count(),
      // Fixed low stock query
      prisma.$queryRaw`
        SELECT COUNT(*)::int as count
        FROM "Inventory" i
        INNER JOIN "Product" p ON i."productId" = p.id
        WHERE i.quantity <= p."reorderLevel"
      `,
      prisma.inventory.findMany({
        include: {
          product: true,
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          inventory: {
            include: {
              product: true,
              warehouse: true,
            },
          },
        },
      }),
    ]);

    // Calculate total inventory value
    const totalInventoryValue = inventoryData.reduce(
      (sum, item) => sum + (item.quantity * parseFloat(item.product.unitPrice)),
      0
    );

    dashboard = {
      overview: {
        totalProducts,
        totalWarehouses,
        totalVendors,
        totalOrders,
        lowStockCount: lowStockCountResult[0].count,
        totalInventoryValue: parseFloat(totalInventoryValue.toFixed(2)),
      },
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      recentTransactions,
    };

    await cacheService.set(cacheKey, dashboard, CACHE_TTL.SHORT);
  }

  ApiResponse.success(res, dashboard);
}),

  // Inventory analytics
getInventoryAnalytics: asyncHandler(async (req, res) => {
  const cacheKey = cacheService.keys.analytics('inventory');
  let analytics = await cacheService.get(cacheKey);

  if (!analytics) {
    const [
      inventoryByWarehouse,
      inventoryByCategory,
      topProducts,
      allInventoryForLowStock,
    ] = await Promise.all([
      prisma.inventory.groupBy({
        by: ['warehouseId'],
        _sum: {
          quantity: true,
        },
      }).then(async (results) => {
        const warehouses = await prisma.warehouse.findMany();
        return results.map(r => {
          const warehouse = warehouses.find(w => w.id === r.warehouseId);
          return {
            warehouseName: warehouse?.name || 'Unknown',
            totalStock: r._sum.quantity,
          };
        });
      }),
      prisma.product.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
      }),
      prisma.inventory.findMany({
        orderBy: {
          quantity: 'desc',
        },
        take: 10,
        include: {
          product: true,
          warehouse: true,
        },
      }),
      prisma.inventory.findMany({
        include: {
          product: true,
          warehouse: true,
        },
      }),
    ]);

    // Filter low stock items in JavaScript
    const lowStockItems = allInventoryForLowStock.filter(
      item => item.quantity <= item.product.reorderLevel
    );

    analytics = {
      inventoryByWarehouse,
      inventoryByCategory,
      topProducts,
      lowStockItems,
    };

    await cacheService.set(cacheKey, analytics, CACHE_TTL.MEDIUM);
  }

  ApiResponse.success(res, analytics);
}),



  // Order analytics
  getOrderAnalytics: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    const [
      ordersByStatus,
      ordersByVendor,
      totalOrderValue,
      averageOrderValue,
      ordersOverTime,
    ] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true,
        },
      }),
      prisma.order.groupBy({
        by: ['vendorId'],
        where,
        _count: {
          vendorId: true,
        },
        _sum: {
          totalAmount: true,
        },
      }).then(async (results) => {
        const vendors = await prisma.vendor.findMany();
        return results.map(r => {
          const vendor = vendors.find(v => v.id === r.vendorId);
          return {
            vendorName: vendor?.name || 'Unknown',
            orderCount: r._count.vendorId,
            totalAmount: parseFloat(r._sum.totalAmount || 0),
          };
        }).sort((a, b) => b.totalAmount - a.totalAmount);
      }),
      prisma.order.aggregate({
        where,
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.order.aggregate({
        where,
        _avg: {
          totalAmount: true,
        },
      }),
      prisma.order.findMany({
        where,
        select: {
          orderDate: true,
          totalAmount: true,
          status: true,
        },
        orderBy: { orderDate: 'asc' },
      }),
    ]);

    const analytics = {
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      ordersByVendor: ordersByVendor.slice(0, 10),
      totalOrderValue: parseFloat(totalOrderValue._sum.totalAmount || 0),
      averageOrderValue: parseFloat(averageOrderValue._avg.totalAmount || 0),
      ordersOverTime,
    };

    ApiResponse.success(res, analytics);
  }),

  // Vendor analytics
  getVendorAnalytics: asyncHandler(async (req, res) => {
    const vendors = await prisma.vendor.findMany({
      include: {
        orders: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    const vendorAnalytics = vendors.map(vendor => {
      const totalOrders = vendor.orders.length;
      const totalAmount = vendor.orders.reduce(
        (sum, order) => sum + parseFloat(order.totalAmount),
        0
      );
      const pendingOrders = vendor.orders.filter(
        order => order.status === 'PENDING'
      ).length;
      const deliveredOrders = vendor.orders.filter(
        order => order.status === 'DELIVERED'
      ).length;

      return {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        totalOrders,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        averageOrderValue: totalOrders > 0 ? parseFloat((totalAmount / totalOrders).toFixed(2)) : 0,
        pendingOrders,
        deliveredOrders,
        deliveryRate: totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(2) : 0,
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);

    ApiResponse.success(res, vendorAnalytics);
  }),

  // Stock movement report
  getStockMovement: asyncHandler(async (req, res) => {
    const { startDate, endDate, warehouseId, productId } = req.query;

    const where = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (warehouseId || productId) {
      where.inventory = {};
      if (warehouseId) where.inventory.warehouseId = warehouseId;
      if (productId) where.inventory.productId = productId;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        inventory: {
          include: {
            product: true,
            warehouse: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const summary = {
      totalTransactions: transactions.length,
      stockIn: transactions.filter(t => t.type === 'STOCK_IN').length,
      stockOut: transactions.filter(t => t.type === 'STOCK_OUT').length,
      adjustments: transactions.filter(t => t.type === 'ADJUSTMENT').length,
      transfers: transactions.filter(t => t.type === 'TRANSFER').length,
    };

    ApiResponse.success(res, {
      summary,
      transactions,
    });
  }),

  // Generate custom report
  generateReport: asyncHandler(async (req, res) => {
    const { reportType, startDate, endDate } = req.query;

    let reportData;

    switch (reportType) {
      case 'inventory':
        reportData = await prisma.inventory.findMany({
          include: {
            product: true,
            warehouse: true,
          },
        });
        break;

      case 'orders':
        const orderWhere = {};
        if (startDate || endDate) {
          orderWhere.orderDate = {};
          if (startDate) orderWhere.orderDate.gte = new Date(startDate);
          if (endDate) orderWhere.orderDate.lte = new Date(endDate);
        }
        reportData = await prisma.order.findMany({
          where: orderWhere,
          include: {
            vendor: true,
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        });
        break;

      case 'transactions':
        const transWhere = {};
        if (startDate || endDate) {
          transWhere.createdAt = {};
          if (startDate) transWhere.createdAt.gte = new Date(startDate);
          if (endDate) transWhere.createdAt.lte = new Date(endDate);
        }
        reportData = await prisma.transaction.findMany({
          where: transWhere,
          include: {
            inventory: {
              include: {
                product: true,
                warehouse: true,
              },
            },
            user: true,
          },
        });
        break;

      default:
        return ApiResponse.error(res, 'Invalid report type', 400);
    }

    ApiResponse.success(res, {
      reportType,
      generatedAt: new Date(),
      data: reportData,
    });
  }),
};

module.exports = analyticsController;
