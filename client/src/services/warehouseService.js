import api from './api';

export const warehouseService = {
  // Get all warehouses
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/warehouses${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Get warehouse by ID
  getById: async (id) => {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  },

  // Create warehouse
  create: async (data) => {
    const response = await api.post('/warehouses', data);
    return response.data;
  },

  // Update warehouse
  update: async (id, data) => {
    const response = await api.put(`/warehouses/${id}`, data);
    return response.data;
  },

  // Delete warehouse
  delete: async (id) => {
    const response = await api.delete(`/warehouses/${id}`);
    return response.data;
  },

  // Get warehouse statistics
  getStats: async (id) => {
    const response = await api.get(`/warehouses/${id}/stats`);
    return response.data;
  },

  // Get warehouse inventory
  getInventory: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/warehouses/${id}/inventory${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Activate warehouse
  activate: async (id) => {
    const response = await api.patch(`/warehouses/${id}/activate`);
    return response.data;
  },

  // Deactivate warehouse
  deactivate: async (id) => {
    const response = await api.patch(`/warehouses/${id}/deactivate`);
    return response.data;
  },

  // Get warehouse capacity utilization
  getCapacityUtilization: async (id) => {
    const response = await api.get(`/warehouses/${id}/capacity`);
    return response.data;
  },

  // Get warehouse performance metrics
  getPerformanceMetrics: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/warehouses/${id}/performance${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Get low stock items in warehouse
  getLowStockItems: async (id) => {
    const response = await api.get(`/warehouses/${id}/low-stock`);
    return response.data;
  },

  // Get warehouse activity log
  getActivityLog: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/warehouses/${id}/activity${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Bulk import warehouses
  bulkImport: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/warehouses/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Export warehouses
  export: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/warehouses/export${queryString ? `?${queryString}` : ''}`,
      {
        responseType: 'blob',
      }
    );
    return response;
  },

  // Search warehouses
  search: async (query) => {
    const response = await api.get(`/warehouses/search?q=${query}`);
    return response.data;
  },

  // Get nearby warehouses
  getNearby: async (latitude, longitude, radius = 50) => {
    const response = await api.get(
      `/warehouses/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
    );
    return response.data;
  },
};

export default warehouseService;
