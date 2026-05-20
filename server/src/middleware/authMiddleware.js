const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('./asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.error(res, 'Not authorized, no token provided', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    if (!user.isActive) {
      return ApiResponse.error(res, 'User account is inactive', 403);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Not authorized, token failed', 401);
  }
});

module.exports = { protect };
