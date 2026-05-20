import api from './api';

export const vendorService = {
  // Get all vendors
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/vendors${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Get vendor by ID
  getById: async (id) => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },

  // Create vendor
  create: async (data) => {
    const response = await api.post('/vendors', data);
    return response.data;
  },

  // Update vendor
  update: async (id, data) => {
    const response = await api.put(`/vendors/${id}`, data);
    return response.data;
  },

  // Delete vendor
  delete: async (id) => {
    const response = await api.delete(`/vendors/${id}`);
    return response.data;
  },

  // Get vendor statistics
  getStats: async (id) => {
    const response = await api.get(`/vendors/${id}/stats`);
    return response.data;
  },

  // Get vendor orders
  getOrders: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/vendors/${id}/orders${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Activate vendor
  activate: async (id) => {
    const response = await api.patch(`/vendors/${id}/activate`);
    return response.data;
  },

  // Deactivate vendor
  deactivate: async (id) => {
    const response = await api.patch(`/vendors/${id}/deactivate`);
    return response.data;
  },

  // Search vendors
  search: async (query) => {
    const response = await api.get(`/vendors/search?q=${query}`);
    return response.data;
  },

  // Export vendors
  export: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/vendors/export${queryString ? `?${queryString}` : ''}`,
      {
        responseType: 'blob',
      }
    );
    return response;
  },
};

export default vendorService;
