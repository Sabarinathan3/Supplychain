const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');

const authController = {
  // Register new user
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    
    ApiResponse.success(
      res,
      result,
      'User registered successfully',
      201
    );
  }),

  // Login user
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    ApiResponse.success(res, result, 'Login successful');
  }),

  // Get current user profile
  getProfile: asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    
    ApiResponse.success(res, user, 'Profile retrieved successfully');
  }),

  // Update profile
  updateProfile: asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);
    
    ApiResponse.success(res, user, 'Profile updated successfully');
  }),

  // Change password
  changePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    
    ApiResponse.success(res, null, 'Password changed successfully');
  }),

  // Logout (client-side token removal)
  logout: asyncHandler(async (req, res) => {
    ApiResponse.success(res, null, 'Logout successful');
  }),
};

module.exports = authController;
