import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import warehouseService from '../../services/warehouseService';

// Initial state
const initialState = {
  warehouses: [],
  selectedWarehouse: null,
  warehouseStats: null,
  warehouseInventory: [],
  lowStockItems: [],
  activityLog: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  filters: {
    search: '',
    isActive: null,
  },
};

// Async thunks
export const fetchWarehouses = createAsyncThunk(
  'warehouse/fetchWarehouses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await warehouseService.getAll(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouses');
    }
  }
);

export const fetchWarehouseById = createAsyncThunk(
  'warehouse/fetchWarehouseById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await warehouseService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouse details');
    }
  }
);

export const createWarehouse = createAsyncThunk(
  'warehouse/createWarehouse',
  async (data, { rejectWithValue }) => {
    try {
      const response = await warehouseService.create(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create warehouse');
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  'warehouse/updateWarehouse',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await warehouseService.update(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update warehouse');
    }
  }
);

export const deleteWarehouse = createAsyncThunk(
  'warehouse/deleteWarehouse',
  async (id, { rejectWithValue }) => {
    try {
      await warehouseService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete warehouse');
    }
  }
);

export const fetchWarehouseStats = createAsyncThunk(
  'warehouse/fetchWarehouseStats',
  async (id, { rejectWithValue }) => {
    try {
      const response = await warehouseService.getStats(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouse statistics');
    }
  }
);

export const fetchWarehouseInventory = createAsyncThunk(
  'warehouse/fetchWarehouseInventory',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const response = await warehouseService.getInventory(id, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouse inventory');
    }
  }
);

export const activateWarehouse = createAsyncThunk(
  'warehouse/activateWarehouse',
  async (id, { rejectWithValue }) => {
    try {
      const response = await warehouseService.activate(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate warehouse');
    }
  }
);

export const deactivateWarehouse = createAsyncThunk(
  'warehouse/deactivateWarehouse',
  async (id, { rejectWithValue }) => {
    try {
      const response = await warehouseService.deactivate(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deactivate warehouse');
    }
  }
);

export const fetchWarehouseLowStock = createAsyncThunk(
  'warehouse/fetchWarehouseLowStock',
  async (id, { rejectWithValue }) => {
    try {
      const response = await warehouseService.getLowStockItems(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch low stock items');
    }
  }
);

export const fetchWarehouseActivityLog = createAsyncThunk(
  'warehouse/fetchWarehouseActivityLog',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const response = await warehouseService.getActivityLog(id, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity log');
    }
  }
);

export const searchWarehouses = createAsyncThunk(
  'warehouse/searchWarehouses',
  async (query, { rejectWithValue }) => {
    try {
      const response = await warehouseService.search(query);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search warehouses');
    }
  }
);

export const fetchNearbyWarehouses = createAsyncThunk(
  'warehouse/fetchNearbyWarehouses',
  async ({ latitude, longitude, radius }, { rejectWithValue }) => {
    try {
      const response = await warehouseService.getNearby(latitude, longitude, radius);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nearby warehouses');
    }
  }
);

// Slice
const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedWarehouse: (state, action) => {
      state.selectedWarehouse = action.payload;
    },
    clearSelectedWarehouse: (state) => {
      state.selectedWarehouse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetWarehouseState: (state) => {
      return initialState;
    },
    updateWarehouseInList: (state, action) => {
      const index = state.warehouses.findIndex((wh) => wh.id === action.payload.id);
      if (index !== -1) {
        state.warehouses[index] = { ...state.warehouses[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch warehouses
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload.data || action.payload;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch warehouse by ID
      .addCase(fetchWarehouseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedWarehouse = action.payload;
      })
      .addCase(fetchWarehouseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create warehouse
      .addCase(createWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses.unshift(action.payload);
      })
      .addCase(createWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update warehouse
      .addCase(updateWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.warehouses.findIndex((wh) => wh.id === action.payload.id);
        if (index !== -1) {
          state.warehouses[index] = action.payload;
        }
        if (state.selectedWarehouse?.id === action.payload.id) {
          state.selectedWarehouse = action.payload;
        }
      })
      .addCase(updateWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete warehouse
      .addCase(deleteWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = state.warehouses.filter((wh) => wh.id !== action.payload);
        if (state.selectedWarehouse?.id === action.payload) {
          state.selectedWarehouse = null;
        }
      })
      .addCase(deleteWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch warehouse stats
      .addCase(fetchWarehouseStats.fulfilled, (state, action) => {
        state.warehouseStats = action.payload;
      })

      // Fetch warehouse inventory
      .addCase(fetchWarehouseInventory.fulfilled, (state, action) => {
        state.warehouseInventory = action.payload.data || action.payload;
      })

      // Activate warehouse
      .addCase(activateWarehouse.fulfilled, (state, action) => {
        const index = state.warehouses.findIndex((wh) => wh.id === action.payload.id);
        if (index !== -1) {
          state.warehouses[index] = action.payload;
        }
      })

      // Deactivate warehouse
      .addCase(deactivateWarehouse.fulfilled, (state, action) => {
        const index = state.warehouses.findIndex((wh) => wh.id === action.payload.id);
        if (index !== -1) {
          state.warehouses[index] = action.payload;
        }
      })

      // Fetch warehouse low stock
      .addCase(fetchWarehouseLowStock.fulfilled, (state, action) => {
        state.lowStockItems = action.payload.data || action.payload;
      })

      // Fetch warehouse activity log
      .addCase(fetchWarehouseActivityLog.fulfilled, (state, action) => {
        state.activityLog = action.payload.data || action.payload;
      })

      // Search warehouses
      .addCase(searchWarehouses.fulfilled, (state, action) => {
        state.warehouses = action.payload.data || action.payload;
      })

      // Fetch nearby warehouses
      .addCase(fetchNearbyWarehouses.fulfilled, (state, action) => {
        state.warehouses = action.payload.data || action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedWarehouse,
  clearSelectedWarehouse,
  clearError,
  resetWarehouseState,
  updateWarehouseInList,
} = warehouseSlice.actions;

export default warehouseSlice.reducer;
