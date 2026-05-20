const logger = require('../config/logger');
const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Prisma errors
  if (err.code === 'P2002') {
    return ApiResponse.error(res, 'Duplicate entry. This record already exists.', 400);
  }

  if (err.code === 'P2025') {
    return ApiResponse.error(res, 'Record not found.', 404);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token expired.', 401);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, 'Validation error.', 400, err.errors);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return ApiResponse.error(res, message, statusCode);
};

module.exports = errorHandler;
