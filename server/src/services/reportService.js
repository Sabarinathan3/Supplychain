const prisma = require('../config/database');
const logger = require('../config/logger');
const { formatCurrency } = require('../utils/helpers');

class ReportService {
  // Generate inventory report
  async generateInventoryReport(filters = {}) {
    try {
      const { warehouseId, category, startDate, endDate, includeZeroStock } = filters;

      const where = {};
      
      if (warehouseId) {
        where.warehouseId = warehouseId;
      }

      if (!includeZeroStock) {
        where.quantity = { gt: 0 };
      }

      if (category) {
        where.product = {
          category,
        };
      }

      const inventory = await prisma.inventory.findMany({
        where,
        include: {
          product: true,
          warehouse: true,
        },
        orderBy: [
          { warehouse: { name: 'asc' } },
          { product: { name: 'asc' } },
        ],
      });

      const reportData = inventory.map(item => ({
        warehouseName: item.warehouse.name,
        warehouseLocation: item.warehouse.location,
        productSKU: item.product.sku,
        productName: item.product.name,
        category: item.product.category,
        quantity: item.quantity,
        unitPrice: parseFloat(item.product.unitPrice),
        totalValue: item.quantity * parseFloat(item.product.unitPrice),
        reorderLevel: item.product.reorderLevel,
        status: item.quantity <= item.product.reorderLevel ? 'Low Stock' : 'Adequate',
        lastRestocked: item.lastRestocked,
      }));

      const summary = {
        totalItems: reportData.length,
        totalQuantity: reportData.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: reportData.reduce((sum, item) => sum + item.totalValue, 0),
        lowStockItems: reportData.filter(item => item.status === 'Low Stock').length,
        byWarehouse: this.groupByWarehouse(reportData),
        byCategory: this.groupByCategory(reportData),
      };

      return {
        reportType: 'Inventory Report',
        generatedAt: new Date(),
        filters,
        summary,
        data: reportData,
      };
    } catch (error) {
      logger.error('Error generating inventory report:', error);
      throw error;
    }
  }

  // Generate sales/order report
  async generateOrderReport(filters = {}) {
    try {
      const { startDate, endDate, vendorId, status } = filters;

      const where = {};

      if (startDate || endDate) {
        where.orderDate = {};
        if (startDate) where.orderDate.gte = new Date(startDate);
        if (endDate) where.orderDate.lte = new Date(endDate);
      }

      if (vendorId) {
        where.vendorId = vendorId;
      }

      if (status) {
        where.status = status;
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          vendor: true,
          user: {
            select: {
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
        orderBy: { orderDate: 'desc' },
      });

      const reportData = orders.map(order => ({
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        vendorName: order.vendor.name,
        vendorEmail: order.vendor.email,
        createdBy: `${order.user.firstName} ${order.user.lastName}`,
        status: order.status,
        totalAmount: parseFloat(order.totalAmount),
        itemCount: order.orderItems.length,
        expectedDelivery: order.expectedDelivery,
        actualDelivery: order.delivery?.deliveryDate,
        deliveryStatus: order.delivery?.status || 'Not Started',
        items: order.orderItems.map(item => ({
          productName: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice),
          subtotal: parseFloat(item.subtotal),
        })),
      }));

      const summary = {
        totalOrders: reportData.length,
        totalAmount: reportData.reduce((sum, order) => sum + order.totalAmount, 0),
        averageOrderValue: reportData.length > 0 
          ? reportData.reduce((sum, order) => sum + order.totalAmount, 0) / reportData.length 
          : 0,
        byStatus: this.groupByStatus(reportData),
        byVendor: this.groupByVendor(reportData),
        deliveryPerformance: this.calculateDeliveryPerformance(reportData),
      };

      return {
        reportType: 'Order Report',
        generatedAt: new Date(),
        filters,
        summary,
        data: reportData,
      };
    } catch (error) {
      logger.error('Error generating order report:', error);
      throw error;
    }
  }

  // Generate stock movement report
  async generateStockMovementReport(filters = {}) {
    try {
      const { startDate, endDate, warehouseId, productId, type } = filters;

      const where = {};

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      if (type) {
        where.type = type;
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
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const reportData = transactions.map(trans => ({
        transactionDate: trans.createdAt,
        type: trans.type,
        warehouseName: trans.inventory.warehouse.name,
        productName: trans.inventory.product.name,
        productSKU: trans.inventory.product.sku,
        quantity: trans.quantity,
        previousQuantity: trans.previousQty,
        newQuantity: trans.newQty,
        unitPrice: parseFloat(trans.inventory.product.unitPrice),
        valueChange: trans.quantity * parseFloat(trans.inventory.product.unitPrice),
        performedBy: `${trans.user.firstName} ${trans.user.lastName}`,
        reference: trans.reference,
        notes: trans.notes,
      }));

      const summary = {
        totalTransactions: reportData.length,
        byType: {
          STOCK_IN: reportData.filter(t => t.type === 'STOCK_IN').length,
          STOCK_OUT: reportData.filter(t => t.type === 'STOCK_OUT').length,
          ADJUSTMENT: reportData.filter(t => t.type === 'ADJUSTMENT').length,
          TRANSFER: reportData.filter(t => t.type === 'TRANSFER').length,
        },
        totalStockIn: reportData
          .filter(t => t.type === 'STOCK_IN')
          .reduce((sum, t) => sum + t.quantity, 0),
        totalStockOut: reportData
          .filter(t => t.type === 'STOCK_OUT')
          .reduce((sum, t) => sum + Math.abs(t.quantity), 0),
        netStockChange: reportData.reduce((sum, t) => {
          if (t.type === 'STOCK_IN') return sum + t.quantity;
          if (t.type === 'STOCK_OUT') return sum - Math.abs(t.quantity);
          return sum;
        }, 0),
        totalValueChange: reportData.reduce((sum, t) => sum + Math.abs(t.valueChange), 0),
      };

      return {
        reportType: 'Stock Movement Report',
        generatedAt: new Date(),
        filters,
        summary,
        data: reportData,
      };
    } catch (error) {
      logger.error('Error generating stock movement report:', error);
      throw error;
    }
  }

  // Generate vendor performance report
  async generateVendorPerformanceReport(filters = {}) {
    try {
      const { startDate, endDate } = filters;

      const where = {};

      if (startDate || endDate) {
        where.orders = {
          some: {
            orderDate: {},
          },
        };
        if (startDate) where.orders.some.orderDate.gte = new Date(startDate);
        if (endDate) where.orders.some.orderDate.lte = new Date(endDate);
      }

      const vendors = await prisma.vendor.findMany({
        where: { isActive: true },
        include: {
          orders: {
            where: where.orders?.some ? { orderDate: where.orders.some.orderDate } : {},
            include: {
              orderItems: true,
              delivery: true,
            },
          },
        },
      });

      const reportData = vendors.map(vendor => {
        const orders = vendor.orders;
        const totalOrders = orders.length;
        const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
        const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
        const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
        
        // Calculate on-time delivery
        const ordersWithDelivery = orders.filter(o => o.delivery && o.delivery.deliveryDate);
        const onTimeDeliveries = ordersWithDelivery.filter(o => {
          if (!o.expectedDelivery) return true;
          return new Date(o.delivery.deliveryDate) <= new Date(o.expectedDelivery);
        }).length;

        return {
          vendorName: vendor.name,
          contactPerson: vendor.contactPerson,
          email: vendor.email,
          phone: vendor.phone,
          totalOrders,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          averageOrderValue: totalOrders > 0 ? parseFloat((totalAmount / totalOrders).toFixed(2)) : 0,
          deliveredOrders,
          cancelledOrders,
          pendingOrders: orders.filter(o => o.status === 'PENDING').length,
          deliveryRate: totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(2) : 0,
          onTimeDeliveryRate: ordersWithDelivery.length > 0 
            ? ((onTimeDeliveries / ordersWithDelivery.length) * 100).toFixed(2) 
            : 'N/A',
          cancellationRate: totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(2) : 0,
          rating: this.calculateVendorRating(deliveredOrders, totalOrders, onTimeDeliveries, ordersWithDelivery.length),
        };
      }).sort((a, b) => b.totalAmount - a.totalAmount);

      const summary = {
        totalVendors: reportData.length,
        totalOrders: reportData.reduce((sum, v) => sum + v.totalOrders, 0),
        totalAmount: reportData.reduce((sum, v) => sum + v.totalAmount, 0),
        averageRating: reportData.length > 0
          ? (reportData.reduce((sum, v) => sum + parseFloat(v.rating), 0) / reportData.length).toFixed(2)
          : 0,
        topVendors: reportData.slice(0, 5),
      };

      return {
        reportType: 'Vendor Performance Report',
        generatedAt: new Date(),
        filters,
        summary,
        data: reportData,
      };
    } catch (error) {
      logger.error('Error generating vendor performance report:', error);
      throw error;
    }
  }

  // Generate warehouse utilization report
  async generateWarehouseUtilizationReport() {
    try {
      const warehouses = await prisma.warehouse.findMany({
        include: {
          inventory: {
            include: {
              product: true,
            },
          },
        },
      });

      const reportData = warehouses.map(warehouse => {
        const totalStock = warehouse.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
        const totalValue = warehouse.inventory.reduce(
          (sum, inv) => sum + (inv.quantity * parseFloat(inv.product.unitPrice)),
          0
        );
        const uniqueProducts = warehouse.inventory.length;
        const utilizationPercentage = warehouse.capacity > 0 
          ? ((totalStock / warehouse.capacity) * 100).toFixed(2) 
          : 0;

        return {
          warehouseName: warehouse.name,
          location: warehouse.location,
          capacity: warehouse.capacity,
          totalStock,
          availableCapacity: warehouse.capacity - totalStock,
          utilizationPercentage: parseFloat(utilizationPercentage),
          uniqueProducts,
          totalValue: parseFloat(totalValue.toFixed(2)),
          averageValuePerUnit: totalStock > 0 ? parseFloat((totalValue / totalStock).toFixed(2)) : 0,
          status: utilizationPercentage >= 90 ? 'Critical' : utilizationPercentage >= 70 ? 'High' : 'Normal',
          isActive: warehouse.isActive,
        };
      });

      const summary = {
        totalWarehouses: reportData.length,
        totalCapacity: reportData.reduce((sum, w) => sum + w.capacity, 0),
        totalStock: reportData.reduce((sum, w) => sum + w.totalStock, 0),
        totalValue: reportData.reduce((sum, w) => sum + w.totalValue, 0),
        averageUtilization: reportData.length > 0
          ? (reportData.reduce((sum, w) => sum + w.utilizationPercentage, 0) / reportData.length).toFixed(2)
          : 0,
        criticalWarehouses: reportData.filter(w => w.status === 'Critical').length,
      };

      return {
        reportType: 'Warehouse Utilization Report',
        generatedAt: new Date(),
        summary,
        data: reportData,
      };
    } catch (error) {
      logger.error('Error generating warehouse utilization report:', error);
      throw error;
    }
  }

  // Generate low stock alert report
  async generateLowStockReport() {
    try {
      const lowStockItems = await prisma.inventory.findMany({
        where: {
          quantity: {
            lte: prisma.raw('(SELECT "reorderLevel" FROM "Product" WHERE "Product"."id" = "Inventory"."productId")'),
          },
        },
        include: {
          product: true,
          warehouse: true,
        },
        orderBy: [
          { quantity: 'asc' },
        ],
      });

      const reportData = lowStockItems.map(item => {
        const daysUntilStockout = this.estimateDaysUntilStockout(item);
        const suggestedReorderQuantity = Math.max(
          item.product.reorderLevel * 2,
          item.product.reorderLevel - item.quantity + 50
        );

        return {
          productName: item.product.name,
          productSKU: item.product.sku,
          category: item.product.category,
          warehouseName: item.warehouse.name,
          currentStock: item.quantity,
          reorderLevel: item.product.reorderLevel,
          unitPrice: parseFloat(item.product.unitPrice),
          stockDeficit: item.product.reorderLevel - item.quantity,
          severity: item.quantity === 0 ? 'Critical' : item.quantity <= item.product.reorderLevel / 2 ? 'High' : 'Medium',
          daysUntilStockout,
          suggestedReorderQuantity,
          estimatedCost: suggestedReorderQuantity * parseFloat(item.product.unitPrice),
          lastRestocked: item.lastRestocked,
        };
      });

      const summary = {
        totalLowStockItems: reportData.length,
        criticalItems: reportData.filter(i => i.severity === 'Critical').length,
        highPriorityItems: reportData.filter(i => i.severity === 'High').length,
        mediumPriorityItems: reportData.filter(i => i.severity === 'Medium').length,
        totalEstimatedRestockCost: reportData.reduce((sum, i) => sum + i.estimatedCost, 0),
        itemsOutOfStock: reportData.filter(i => i.currentStock === 0).length,
      };

      return {
        reportType: 'Low Stock Alert Report',
        generatedAt: new Date(),
        summary,
        data: reportData,
      };
    } catch (error) {
      logger.error('Error generating low stock report:', error);
      throw error;
    }
  }

  // Helper: Group by warehouse
  groupByWarehouse(data) {
    const grouped = {};
    data.forEach(item => {
      if (!grouped[item.warehouseName]) {
        grouped[item.warehouseName] = {
          totalItems: 0,
          totalQuantity: 0,
          totalValue: 0,
        };
      }
      grouped[item.warehouseName].totalItems++;
      grouped[item.warehouseName].totalQuantity += item.quantity;
      grouped[item.warehouseName].totalValue += item.totalValue;
    });
    return grouped;
  }

  // Helper: Group by category
  groupByCategory(data) {
    const grouped = {};
    data.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = {
          totalItems: 0,
          totalQuantity: 0,
          totalValue: 0,
        };
      }
      grouped[item.category].totalItems++;
      grouped[item.category].totalQuantity += item.quantity;
      grouped[item.category].totalValue += item.totalValue;
    });
    return grouped;
  }

  // Helper: Group by status
  groupByStatus(data) {
    const grouped = {};
    data.forEach(order => {
      grouped[order.status] = (grouped[order.status] || 0) + 1;
    });
    return grouped;
  }

  // Helper: Group by vendor
  groupByVendor(data) {
    const grouped = {};
    data.forEach(order => {
      if (!grouped[order.vendorName]) {
        grouped[order.vendorName] = {
          orderCount: 0,
          totalAmount: 0,
        };
      }
      grouped[order.vendorName].orderCount++;
      grouped[order.vendorName].totalAmount += order.totalAmount;
    });
    return grouped;
  }

  // Helper: Calculate delivery performance
  calculateDeliveryPerformance(data) {
    const ordersWithDelivery = data.filter(o => o.actualDelivery);
    const onTimeDeliveries = ordersWithDelivery.filter(o => {
      if (!o.expectedDelivery) return true;
      return new Date(o.actualDelivery) <= new Date(o.expectedDelivery);
    });

    return {
      totalDeliveries: ordersWithDelivery.length,
      onTimeDeliveries: onTimeDeliveries.length,
      lateDeliveries: ordersWithDelivery.length - onTimeDeliveries.length,
      onTimeRate: ordersWithDelivery.length > 0 
        ? ((onTimeDeliveries.length / ordersWithDelivery.length) * 100).toFixed(2) 
        : 0,
    };
  }

  // Helper: Calculate vendor rating
  calculateVendorRating(deliveredOrders, totalOrders, onTimeDeliveries, ordersWithDelivery) {
    if (totalOrders === 0) return 0;

    const deliveryRate = deliveredOrders / totalOrders;
    const onTimeRate = ordersWithDelivery > 0 ? onTimeDeliveries / ordersWithDelivery : 1;
    
    // Rating formula: 40% delivery rate + 60% on-time rate
    const rating = (deliveryRate * 0.4 + onTimeRate * 0.6) * 5;
    
    return rating.toFixed(2);
  }

  // Helper: Estimate days until stockout
  estimateDaysUntilStockout(inventoryItem) {
    // Simplified estimation - in real scenario, use historical data
    if (inventoryItem.quantity === 0) return 0;
    
    // Assume average daily usage is 5% of reorder level
    const avgDailyUsage = inventoryItem.product.reorderLevel * 0.05;
    if (avgDailyUsage === 0) return 999;
    
    return Math.floor(inventoryItem.quantity / avgDailyUsage);
  }

  // Export report to CSV format
  exportToCSV(reportData) {
    if (!reportData.data || reportData.data.length === 0) {
      return '';
    }

    const headers = Object.keys(reportData.data[0]);
    const csvRows = [headers.join(',')];

    for (const row of reportData.data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and handle arrays/objects
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}

module.exports = new ReportService();
