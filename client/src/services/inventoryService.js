import api from './api';

export const inventoryService = {
  // Get all inventory
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/inventory${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Get inventory by ID
  getById: async (id) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  // Add stock
  addStock: async (data) => {
    const response = await api.post('/inventory/add', data);
    return response.data;
  },

  // Remove stock
  removeStock: async (data) => {
    const response = await api.post('/inventory/remove', data);
    return response.data;
  },

  // Adjust stock
  adjustStock: async (data) => {
    const response = await api.post('/inventory/adjust', data);
    return response.data;
  },

  // Transfer stock
  transferStock: async (data) => {
    const response = await api.post('/inventory/transfer', data);
    return response.data;
  },

  // Get low stock items
  getLowStock: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/inventory/low-stock${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Get out of stock items
  getOutOfStock: async () => {
    const response = await api.get('/inventory/out-of-stock');
    return response.data;
  },

  // Get inventory by product
  getByProduct: async (productId) => {
    const response = await api.get(`/inventory/product/${productId}`);
    return response.data;
  },

  // Get inventory by warehouse
  getByWarehouse: async (warehouseId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/inventory/warehouse/${warehouseId}${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Get inventory transactions
  getTransactions: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/inventory/${id}/transactions${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Get all transactions
  getAllTransactions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/inventory/transactions${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Scan QR/Barcode
  scan: async (code) => {
    const response = await api.post('/inventory/scan', { code });
    return response.data;
  },

  // Get inventory summary
  getSummary: async () => {
    const response = await api.get('/inventory/summary');
    return response.data;
  },

  // Get inventory valuation
  getValuation: async (warehouseId = null) => {
    const url = warehouseId 
      ? `/inventory/valuation?warehouseId=${warehouseId}`
      : '/inventory/valuation';
    const response = await api.get(url);
    return response.data;
  },

  // Get stock movement history
  getStockMovement: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/inventory/stock-movement${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Get inventory aging report
  getAgingReport: async (warehouseId = null) => {
    const url = warehouseId
      ? `/inventory/aging?warehouseId=${warehouseId}`
      : '/inventory/aging';
    const response = await api.get(url);
    return response.data;
  },

  // Get inventory turnover
  getTurnover: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/inventory/turnover${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Perform stock count
  stockCount: async (data) => {
    const response = await api.post('/inventory/stock-count', data);
    return response.data;
  },

  // Get stock alerts
  getAlerts: async () => {
    const response = await api.get('/inventory/alerts');
    return response.data;
  },

  // Update reorder level
  updateReorderLevel: async (id, reorderLevel) => {
    const response = await api.patch(`/inventory/${id}/reorder-level`, {
      reorderLevel,
    });
    return response.data;
  },

  // Get inventory forecast
  getForecast: async (productId, months = 6) => {
    const response = await api.get(
      `/inventory/forecast?productId=${productId}&months=${months}`
    );
    return response.data;
  },

  // Bulk update inventory
  bulkUpdate: async (updates) => {
    const response = await api.post('/inventory/bulk-update', { updates });
    return response.data;
  },

  // Export inventory
  export: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/inventory/export${queryString ? `?${queryString}` : ''}`,
      {
        responseType: 'blob',
      }
    );
    return response;
  },

  // Import inventory
  import: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/inventory/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get inventory by category
  getByCategory: async (category, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/inventory/category/${category}${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Get dead stock
  getDeadStock: async (days = 90) => {
    const response = await api.get(`/inventory/dead-stock?days=${days}`);
    return response.data;
  },

  // Reserve stock
  reserveStock: async (data) => {
    const response = await api.post('/inventory/reserve', data);
    return response.data;
  },

  // Release reserved stock
  releaseReservedStock: async (reservationId) => {
    const response = await api.post(`/inventory/release/${reservationId}`);
    return response.data;
  },

  // Get reserved stock
  getReservedStock: async () => {
    const response = await api.get('/inventory/reserved');
    return response.data;
  },

  // Generate stock report
  generateReport: async (params = {}) => {
    const response = await api.post('/inventory/generate-report', params);
    return response.data;
  },

  // Get stock availability
  checkAvailability: async (productId, warehouseId, quantity) => {
    const response = await api.get(
      `/inventory/check-availability?productId=${productId}&warehouseId=${warehouseId}&quantity=${quantity}`
    );
    return response.data;
  },

  // Get inventory dashboard data
  getDashboard: async () => {
    const response = await api.get('/inventory/dashboard');
    return response.data;
  },
};

export default inventoryService;
