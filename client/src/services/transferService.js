import api from './api';

export const transferService = {
  // Get all transfers
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/transfers${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Get transfer by ID
  getById: async (id) => {
    const response = await api.get(`/transfers/${id}`);
    return response.data;
  },

  // Create transfer
  create: async (data) => {
    const response = await api.post('/transfers', data);
    return response.data;
  },

  // Approve transfer
  approve: async (id) => {
    const response = await api.post(`/transfers/${id}/approve`);
    return response.data;
  },

  // Reject transfer
  reject: async (id, reason) => {
    const response = await api.post(`/transfers/${id}/reject`, { reason });
    return response.data;
  },

  // Cancel transfer
  cancel: async (id, reason) => {
    const response = await api.post(`/transfers/${id}/cancel`, { reason });
    return response.data;
  },

  // Get pending transfers
  getPending: async () => {
    const response = await api.get('/transfers/pending');
    return response.data;
  },

  // Get transfer statistics
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/transfers/stats${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Get transfers by warehouse
  getByWarehouse: async (warehouseId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/transfers/warehouse/${warehouseId}${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },
};

export default transferService;
