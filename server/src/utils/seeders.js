const prisma = require('../config/database');
const authService = require('../services/authService');
const qrService = require('../services/qrService');
const logger = require('../config/logger');

async function seed() {
  try {
    logger.info('Starting database seeding...');

    // Create users
    logger.info('Creating users...');
    const adminPassword = await authService.hashPassword('Admin@123');
    const managerPassword = await authService.hashPassword('Manager@123');
    const vendorPassword = await authService.hashPassword('Vendor@123');
    const viewerPassword = await authService.hashPassword('Viewer@123');

    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'admin@company.com',
          password: adminPassword,
          firstName: 'System',
          lastName: 'Admin',
          role: 'ADMIN',
        },
      }),
      prisma.user.create({
        data: {
          email: 'manager@company.com',
          password: managerPassword,
          firstName: 'John',
          lastName: 'Manager',
          role: 'WAREHOUSE_MANAGER',
        },
      }),
      prisma.user.create({
        data: {
          email: 'vendor@company.com',
          password: vendorPassword,
          firstName: 'Vendor',
          lastName: 'User',
          role: 'VENDOR',
        },
      }),
      prisma.user.create({
        data: {
          email: 'viewer@company.com',
          password: viewerPassword,
          firstName: 'Jane',
          lastName: 'Viewer',
          role: 'VIEWER',
        },
      }),
    ]);
    logger.info(`Created ${users.length} users`);

    // Create warehouses
    logger.info('Creating warehouses...');
    const warehouses = await Promise.all([
      prisma.warehouse.create({
        data: {
          name: 'Main Warehouse',
          location: 'Berlin, Germany',
          address: '123 Industrial Street, Berlin, 10115',
          capacity: 10000,
          managerId: users[1].id,
        },
      }),
      prisma.warehouse.create({
        data: {
          name: 'Secondary Warehouse',
          location: 'Munich, Germany',
          address: '456 Storage Avenue, Munich, 80331',
          capacity: 8000,
        },
      }),
      prisma.warehouse.create({
        data: {
          name: 'Dubai Logistics Center',
          location: 'Dubai, UAE',
          address: '789 Logistics Road, Dubai',
          capacity: 15000,
        },
      }),
    ]);
    logger.info(`Created ${warehouses.length} warehouses`);

    // Create vendors
    logger.info('Creating vendors...');
    const vendors = await Promise.all([
      prisma.vendor.create({
        data: {
          name: 'Tech Supplies GmbH',
          email: 'sales@techsupplies.de',
          phone: '+49-30-12345678',
          address: 'Berlin, Germany',
          contactPerson: 'Hans Mueller',
        },
      }),
      prisma.vendor.create({
        data: {
          name: 'Global Parts LLC',
          email: 'orders@globalparts.com',
          phone: '+971-4-9876543',
          address: 'Dubai, UAE',
          contactPerson: 'Ahmed Al-Rashid',
        },
      }),
      prisma.vendor.create({
        data: {
          name: 'Industrial Solutions Inc',
          email: 'contact@indsolutions.com',
          phone: '+49-89-5551234',
          address: 'Munich, Germany',
          contactPerson: 'Maria Schmidt',
        },
      }),
    ]);
    logger.info(`Created ${vendors.length} vendors`);

    // Create products
    logger.info('Creating products...');
    const categories = ['Electronics', 'Hardware', 'Tools', 'Safety Equipment', 'Office Supplies'];
    const products = [];

    for (let i = 1; i <= 20; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const product = await prisma.product.create({
        data: {
          sku: `SKU-${String(i).padStart(4, '0')}`,
          name: `Product ${i}`,
          description: `This is product ${i} in the ${category} category`,
          category,
          unitPrice: Math.floor(Math.random() * 900) + 100, // 100-1000
          reorderLevel: Math.floor(Math.random() * 20) + 10, // 10-30
          qrCode: qrService.generateUniqueCode('PRD'),
          barcode: `BAR${String(i).padStart(10, '0')}`,
        },
      });
      products.push(product);
    }
    logger.info(`Created ${products.length} products`);

    // Create inventory
    logger.info('Creating inventory...');
    let inventoryCount = 0;
    for (const warehouse of warehouses) {
      // Randomly assign 10-15 products to each warehouse
      const productsForWarehouse = products
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 6) + 10);

      for (const product of productsForWarehouse) {
        await prisma.inventory.create({
          data: {
            productId: product.id,
            warehouseId: warehouse.id,
            quantity: Math.floor(Math.random() * 100) + 20, // 20-120
            lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        });
        inventoryCount++;
      }
    }
    logger.info(`Created ${inventoryCount} inventory records`);

    // Create sample orders
    logger.info('Creating orders...');
    const orderStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    for (let i = 0; i < 10; i++) {
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      const orderProducts = products.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);
      
      const orderItems = orderProducts.map(product => ({
        productId: product.id,
        quantity: Math.floor(Math.random() * 10) + 1,
        unitPrice: product.unitPrice,
        subtotal: (Math.floor(Math.random() * 10) + 1) * parseFloat(product.unitPrice),
      }));

      const totalAmount = orderItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

      await prisma.order.create({
        data: {
          orderNumber: `ORD-26${String(i + 1).padStart(4, '0')}`,
          vendorId: vendor.id,
          userId: users[0].id,
          status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
          totalAmount,
          orderDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Last 60 days
          expectedDelivery: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Next 30 days
          orderItems: {
            create: orderItems,
          },
        },
      });
    }
    logger.info('Created 10 orders');

    logger.info('✅ Database seeding completed successfully!');
    logger.info('\nDefault Users:');
    logger.info('Admin: admin@company.com / Admin@123');
    logger.info('Manager: manager@company.com / Manager@123');
    logger.info('Vendor: vendor@company.com / Vendor@123');
    logger.info('Viewer: viewer@company.com / Viewer@123');

  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder if called directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seed;
