import api from './api';

export const orderService = {
  // Get all orders
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/orders${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Get order by ID
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Create order
  create: async (data) => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Update order
  update: async (id, data) => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  // Update order status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Cancel order
  cancel: async (id, reason) => {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Delete order
  delete: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  // Get order statistics
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/orders/stats${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Get orders by status
  getByStatus: async (status, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/orders/status/${status}${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Get orders by vendor
  getByVendor: async (vendorId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/orders/vendor/${vendorId}${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Export orders
  export: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/orders/export${queryString ? `?${queryString}` : ''}`,
      {
        responseType: 'blob',
      }
    );
    return response;
  },
};

export default orderService;
