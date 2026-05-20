const prisma = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');
const { sanitizeUser, getPaginationOffset } = require('../utils/helpers');
const { PAGINATION } = require('../utils/constants');

const userController = {
  // Get all users (Admin only)
  getAll: asyncHandler(async (req, res) => {
    const { 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT,
      role,
      isActive,
      search 
    } = req.query;
    
    const offset = getPaginationOffset(page, limit);

    const where = {};
    
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              transactions: true,
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    ApiResponse.paginated(res, users, page, limit, total);
  }),

  // Get user by ID
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            inventory: {
              include: {
                product: true,
                warehouse: true,
              },
            },
          },
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            vendor: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            orders: true,
          },
        },
      },
    });

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    ApiResponse.success(res, user);
  }),

  // Create new user (Admin only)
  create: asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return ApiResponse.error(res, 'User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await authService.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'VIEWER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    ApiResponse.success(res, user, 'User created successfully', 201);
  }),

  // Update user (Admin or self)
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, role, isActive } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    // Only admin can update role and isActive
    const updateData = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
    };

    // If admin, allow role and isActive updates
    if (req.user.role === 'ADMIN') {
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    ApiResponse.success(res, user, 'User updated successfully');
  }),

  // Delete user (Admin only)
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent deleting self
    if (id === req.user.id) {
      return ApiResponse.error(res, 'Cannot delete your own account', 400);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: true,
            orders: true,
          },
        },
      },
    });

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    // Check if user has associated records
    if (user._count.transactions > 0 || user._count.orders > 0) {
      return ApiResponse.error(
        res,
        'Cannot delete user with existing transactions or orders. Consider deactivating instead.',
        400
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    ApiResponse.success(res, null, 'User deleted successfully');
  }),

  // Deactivate user (Admin only)
  deactivate: asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent deactivating self
    if (id === req.user.id) {
      return ApiResponse.error(res, 'Cannot deactivate your own account', 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    ApiResponse.success(res, user, 'User deactivated successfully');
  }),

  // Activate user (Admin only)
  activate: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    ApiResponse.success(res, user, 'User activated successfully');
  }),

  // Reset user password (Admin only)
  resetPassword: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return ApiResponse.error(res, 'Password must be at least 6 characters', 400);
    }

    // Hash new password
    const hashedPassword = await authService.hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    ApiResponse.success(res, null, 'Password reset successfully');
  }),

  // Get user statistics
  getStats: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        transactions: true,
        orders: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    const totalTransactions = user.transactions.length;
    const totalOrders = user.orders.length;
    const totalOrderValue = user.orders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount),
      0
    );

    const transactionsByType = user.transactions.reduce((acc, trans) => {
      acc[trans.type] = (acc[trans.type] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      totalTransactions,
      transactionsByType,
      totalOrders,
      totalOrderValue: parseFloat(totalOrderValue.toFixed(2)),
      averageOrderValue: totalOrders > 0 ? parseFloat((totalOrderValue / totalOrders).toFixed(2)) : 0,
      accountCreated: user.createdAt,
    };

    ApiResponse.success(res, stats);
  }),

  // Get user activity log
  getActivity: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const [transactions, orders] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: id },
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          inventory: {
            include: {
              product: true,
              warehouse: true,
            },
          },
        },
      }),
      prisma.order.findMany({
        where: { userId: id },
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      }),
    ]);

    // Combine and sort activities
    const activities = [
      ...transactions.map(t => ({
        type: 'transaction',
        action: t.type,
        timestamp: t.createdAt,
        details: t,
      })),
      ...orders.map(o => ({
        type: 'order',
        action: 'ORDER_CREATED',
        timestamp: o.createdAt,
        details: o,
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    ApiResponse.success(res, activities.slice(0, parseInt(limit)));
  }),

  // Get users by role
  getUsersByRole: asyncHandler(async (req, res) => {
    const { role } = req.params;

    const validRoles = ['ADMIN', 'WAREHOUSE_MANAGER', 'VENDOR', 'VIEWER'];
    if (!validRoles.includes(role)) {
      return ApiResponse.error(res, 'Invalid role', 400);
    }

    const users = await prisma.user.findMany({
      where: { 
        role,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    ApiResponse.success(res, users);
  }),
};

module.exports = userController;
