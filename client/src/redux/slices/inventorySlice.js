import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import inventoryService from '../../services/inventoryService';

// Initial state
const initialState = {
  inventory: [],
  selectedInventory: null,
  transactions: [],
  lowStock: [],
  outOfStock: [],
  summary: null,
  valuation: null,
  alerts: [],
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
    warehouseId: null,
    productId: null,
    category: null,
  },
};

// Async thunks
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getAll(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory');
    }
  }
);

export const fetchInventoryById = createAsyncThunk(
  'inventory/fetchInventoryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory details');
    }
  }
);

export const addStock = createAsyncThunk(
  'inventory/addStock',
  async (data, { rejectWithValue }) => {
    try {
      const response = await inventoryService.addStock(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add stock');
    }
  }
);

export const removeStock = createAsyncThunk(
  'inventory/removeStock',
  async (data, { rejectWithValue }) => {
    try {
      const response = await inventoryService.removeStock(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove stock');
    }
  }
);

export const adjustStock = createAsyncThunk(
  'inventory/adjustStock',
  async (data, { rejectWithValue }) => {
    try {
      const response = await inventoryService.adjustStock(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to adjust stock');
    }
  }
);

export const transferStock = createAsyncThunk(
  'inventory/transferStock',
  async (data, { rejectWithValue }) => {
    try {
      const response = await inventoryService.transferStock(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to transfer stock');
    }
  }
);

export const fetchLowStock = createAsyncThunk(
  'inventory/fetchLowStock',
  async (params, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getLowStock(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch low stock items');
    }
  }
);

export const fetchOutOfStock = createAsyncThunk(
  'inventory/fetchOutOfStock',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getOutOfStock();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch out of stock items');
    }
  }
);

export const fetchInventoryByProduct = createAsyncThunk(
  'inventory/fetchInventoryByProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getByProduct(productId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product inventory');
    }
  }
);

export const fetchInventoryByWarehouse = createAsyncThunk(
  'inventory/fetchInventoryByWarehouse',
  async ({ warehouseId, params }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getByWarehouse(warehouseId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouse inventory');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'inventory/fetchTransactions',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getTransactions(id, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchAllTransactions = createAsyncThunk(
  'inventory/fetchAllTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getAllTransactions(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all transactions');
    }
  }
);

export const fetchInventorySummary = createAsyncThunk(
  'inventory/fetchInventorySummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getSummary();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory summary');
    }
  }
);

export const fetchInventoryValuation = createAsyncThunk(
  'inventory/fetchInventoryValuation',
  async (warehouseId, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getValuation(warehouseId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory valuation');
    }
  }
);

export const fetchStockAlerts = createAsyncThunk(
  'inventory/fetchStockAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getAlerts();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stock alerts');
    }
  }
);

export const updateReorderLevel = createAsyncThunk(
  'inventory/updateReorderLevel',
  async ({ id, reorderLevel }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.updateReorderLevel(id, reorderLevel);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update reorder level');
    }
  }
);

export const performStockCount = createAsyncThunk(
  'inventory/performStockCount',
  async (data, { rejectWithValue }) => {
    try {
      const response = await inventoryService.stockCount(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to perform stock count');
    }
  }
);

export const scanInventory = createAsyncThunk(
  'inventory/scanInventory',
  async (code, { rejectWithValue }) => {
    try {
      const response = await inventoryService.scan(code);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to scan inventory');
    }
  }
);

export const bulkUpdateInventory = createAsyncThunk(
  'inventory/bulkUpdateInventory',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await inventoryService.bulkUpdate(updates);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk update inventory');
    }
  }
);

// Slice
const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedInventory: (state, action) => {
      state.selectedInventory = action.payload;
    },
    clearSelectedInventory: (state) => {
      state.selectedInventory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetInventoryState: (state) => {
      return initialState;
    },
    updateInventoryItem: (state, action) => {
      const index = state.inventory.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.inventory[index] = { ...state.inventory[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch inventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload.data || action.payload;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch inventory by ID
      .addCase(fetchInventoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInventory = action.payload;
      })
      .addCase(fetchInventoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add stock
      .addCase(addStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStock.fulfilled, (state, action) => {
        state.loading = false;
        // Update inventory list if the item exists, otherwise add it
        const index = state.inventory.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.inventory[index] = action.payload;
        } else {
          state.inventory.unshift(action.payload);
        }
      })
      .addCase(addStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove stock
      .addCase(removeStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.inventory.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.inventory[index] = action.payload;
        }
      })
      .addCase(removeStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Adjust stock
      .addCase(adjustStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adjustStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.inventory.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.inventory[index] = action.payload;
        }
      })
      .addCase(adjustStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Transfer stock
      .addCase(transferStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(transferStock.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(transferStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch low stock
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.lowStock = action.payload.data || action.payload;
      })

      // Fetch out of stock
      .addCase(fetchOutOfStock.fulfilled, (state, action) => {
        state.outOfStock = action.payload.data || action.payload;
      })

      // Fetch transactions
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload.data || action.payload;
      })

      // Fetch all transactions
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload.data || action.payload;
      })

      // Fetch inventory summary
      .addCase(fetchInventorySummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })

      // Fetch inventory valuation
      .addCase(fetchInventoryValuation.fulfilled, (state, action) => {
        state.valuation = action.payload;
      })

      // Fetch stock alerts
      .addCase(fetchStockAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload.data || action.payload;
      })

      // Update reorder level
      .addCase(updateReorderLevel.fulfilled, (state, action) => {
        const index = state.inventory.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.inventory[index] = action.payload;
        }
      })

      // Perform stock count
      .addCase(performStockCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performStockCount.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(performStockCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Scan inventory
      .addCase(scanInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scanInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInventory = action.payload;
      })
      .addCase(scanInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk update inventory
      .addCase(bulkUpdateInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateInventory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(bulkUpdateInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSelectedInventory,
  clearSelectedInventory,
  clearError,
  resetInventoryState,
  updateInventoryItem,
} = inventorySlice.actions;

export default inventorySlice.reducer;
