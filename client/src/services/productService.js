import api from './api';

export const productService = {
  // Get all products
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Get product by ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get product by SKU
  getBySKU: async (sku) => {
    const response = await api.get(`/products/code/${sku}`);
    return response.data;
  },

  // Create product
  create: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Update product
  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get product QR code
  getQRCode: async (id) => {
    const response = await api.get(`/products/${id}/qr-code`, {
      responseType: 'blob',
    });
    return response;
  },

  // Get product categories
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  // Search products
  search: async (query) => {
    const response = await api.get(`/products/search?q=${query}`);
    return response.data;
  },

  // Get products by category
  getByCategory: async (category, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/products/category/${category}${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },

  // Bulk import products
  bulkImport: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/products/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Export products
  export: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/products/export${queryString ? `?${queryString}` : ''}`,
      {
        responseType: 'blob',
      }
    );
    return response;
  },

  // Upload product image
  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get product inventory across warehouses
  getInventory: async (id) => {
    const response = await api.get(`/products/${id}/inventory`);
    return response.data;
  },

  // Get product history
  getHistory: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(
      `/products/${id}/history${queryString ? `?${queryString}` : ''}`
    );
    return response.data;
  },
};

export default productService;
