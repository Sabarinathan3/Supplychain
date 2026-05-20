const ApiResponse = require('../utils/apiResponse');
const { USER_ROLES } = require('../utils/constants');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'User not authenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `User role '${req.user.role}' is not authorized to access this resource`,
        403
      );
    }

    next();
  };
};

// Predefined role combinations
const roleMiddleware = {
  adminOnly: authorize(USER_ROLES.ADMIN),
  adminOrManager: authorize(USER_ROLES.ADMIN, USER_ROLES.WAREHOUSE_MANAGER),
  notVendor: authorize(USER_ROLES.ADMIN, USER_ROLES.WAREHOUSE_MANAGER, USER_ROLES.VIEWER),
  allRoles: authorize(USER_ROLES.ADMIN, USER_ROLES.WAREHOUSE_MANAGER, USER_ROLES.VENDOR, USER_ROLES.VIEWER),
};

module.exports = { authorize, ...roleMiddleware };
