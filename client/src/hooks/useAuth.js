import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  updateProfile as updateProfileAction,
} from '../redux/slices/authSlice';
import { authService } from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  // Login
  const login = useCallback(
    async (credentials) => {
      dispatch(loginStart());
      try {
        const response = await authService.login(credentials);
        dispatch(loginSuccess(response));
        navigate('/');
        return { success: true };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Login failed';
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch, navigate]
  );

  // Register
  const register = useCallback(
    async (userData) => {
      dispatch(loginStart());
      try {
        const response = await authService.register(userData);
        dispatch(loginSuccess(response));
        navigate('/');
        return { success: true };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Registration failed';
        dispatch(loginFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch, navigate]
  );

  // Logout
  const logout = useCallback(() => {
    dispatch(logoutAction());
    navigate('/login');
  }, [dispatch, navigate]);

  // Update profile
  const updateProfile = useCallback(
    async (data) => {
      try {
        const response = await authService.updateProfile(data);
        dispatch(updateProfileAction(response));
        return { success: true, data: response };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to update profile';
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  // Change password
  const changePassword = useCallback(async (data) => {
    try {
      await authService.changePassword(data);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Check if user has specific role
  const hasRole = useCallback(
    (role) => {
      return user?.role === role;
    },
    [user]
  );

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback(
    (roles) => {
      return roles.includes(user?.role);
    },
    [user]
  );

  // Check if user is authorized for a specific action
  const isAuthorized = useCallback(
    (requiredRole) => {
      if (!user) return false;
      if (!requiredRole) return true;
      
      const roleHierarchy = {
        ADMIN: 4,
        WAREHOUSE_MANAGER: 3,
        VENDOR: 2,
        VIEWER: 1,
      };

      return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    },
    [user]
  );

  return {
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,

    // Authorization helpers
    hasRole,
    hasAnyRole,
    isAuthorized,
  };
};

export default useAuth;
