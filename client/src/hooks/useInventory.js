import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchInventory,
  fetchInventoryById,
  addStock,
  removeStock,
  adjustStock,
  transferStock,
  fetchLowStock,
  fetchOutOfStock,
  fetchInventoryByProduct,
  fetchInventoryByWarehouse,
  fetchTransactions,
  fetchAllTransactions,
  fetchInventorySummary,
  fetchInventoryValuation,
  fetchStockAlerts,
  updateReorderLevel,
  performStockCount,
  scanInventory,
  bulkUpdateInventory,
  setFilters,
  clearFilters,
  setSelectedInventory,
  clearSelectedInventory,
  clearError,
} from '../redux/slices/inventorySlice';

export const useInventory = () => {
  const dispatch = useDispatch();
  const {
    inventory,
    selectedInventory,
    transactions,
    lowStock,
    outOfStock,
    summary,
    valuation,
    alerts,
    pagination,
    loading,
    error,
    filters,
  } = useSelector((state) => state.inventory);

  // Fetch inventory
  const getInventory = useCallback(
    (params) => {
      return dispatch(fetchInventory(params));
    },
    [dispatch]
  );

  // Fetch inventory by ID
  const getInventoryById = useCallback(
    (id) => {
      return dispatch(fetchInventoryById(id));
    },
    [dispatch]
  );

  // Add stock
  const addInventoryStock = useCallback(
    (data) => {
      return dispatch(addStock(data));
    },
    [dispatch]
  );

  // Remove stock
  const removeInventoryStock = useCallback(
    (data) => {
      return dispatch(removeStock(data));
    },
    [dispatch]
  );

  // Adjust stock
  const adjustInventoryStock = useCallback(
    (data) => {
      return dispatch(adjustStock(data));
    },
    [dispatch]
  );

  // Transfer stock
  const transferInventoryStock = useCallback(
    (data) => {
      return dispatch(transferStock(data));
    },
    [dispatch]
  );

  // Get low stock items
  const getLowStock = useCallback(
    (params) => {
      return dispatch(fetchLowStock(params));
    },
    [dispatch]
  );

  // Get out of stock items
  const getOutOfStock = useCallback(() => {
    return dispatch(fetchOutOfStock());
  }, [dispatch]);

  // Get inventory by product
  const getInventoryByProduct = useCallback(
    (productId) => {
      return dispatch(fetchInventoryByProduct(productId));
    },
    [dispatch]
  );

  // Get inventory by warehouse
  const getInventoryByWarehouse = useCallback(
    (warehouseId, params) => {
      return dispatch(fetchInventoryByWarehouse({ warehouseId, params }));
    },
    [dispatch]
  );

  // Get transactions
  const getTransactions = useCallback(
    (id, params) => {
      return dispatch(fetchTransactions({ id, params }));
    },
    [dispatch]
  );

  // Get all transactions
  const getAllTransactions = useCallback(
    (params) => {
      return dispatch(fetchAllTransactions(params));
    },
    [dispatch]
  );

  // Get inventory summary
  const getInventorySummary = useCallback(() => {
    return dispatch(fetchInventorySummary());
  }, [dispatch]);

  // Get inventory valuation
  const getInventoryValuation = useCallback(
    (warehouseId) => {
      return dispatch(fetchInventoryValuation(warehouseId));
    },
    [dispatch]
  );

  // Get stock alerts
  const getStockAlerts = useCallback(() => {
    return dispatch(fetchStockAlerts());
  }, [dispatch]);

  // Update reorder level
  const updateInventoryReorderLevel = useCallback(
    (id, reorderLevel) => {
      return dispatch(updateReorderLevel({ id, reorderLevel }));
    },
    [dispatch]
  );

  // Perform stock count
  const doStockCount = useCallback(
    (data) => {
      return dispatch(performStockCount(data));
    },
    [dispatch]
  );

  // Scan inventory
  const scanInventoryCode = useCallback(
    (code) => {
      return dispatch(scanInventory(code));
    },
    [dispatch]
  );

  // Bulk update inventory
  const bulkUpdate = useCallback(
    (updates) => {
      return dispatch(bulkUpdateInventory(updates));
    },
    [dispatch]
  );

  // Set filters
  const updateFilters = useCallback(
    (newFilters) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  // Clear filters
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Set selected inventory
  const selectInventory = useCallback(
    (item) => {
      dispatch(setSelectedInventory(item));
    },
    [dispatch]
  );

  // Clear selected inventory
  const clearSelected = useCallback(() => {
    dispatch(clearSelectedInventory());
  }, [dispatch]);

  // Clear error
  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Check if stock is low
  const isLowStock = useCallback(
    (quantity, reorderLevel) => {
      return quantity <= reorderLevel;
    },
    []
  );

  // Check if out of stock
  const isOutOfStock = useCallback((quantity) => {
    return quantity === 0;
  }, []);

  // Get stock status
  const getStockStatus = useCallback((quantity, reorderLevel) => {
    if (quantity === 0) return 'OUT_OF_STOCK';
    if (quantity <= reorderLevel) return 'LOW_STOCK';
    if (quantity <= reorderLevel * 1.5) return 'MODERATE';
    return 'IN_STOCK';
  }, []);

  return {
    // State
    inventory,
    selectedInventory,
    transactions,
    lowStock,
    outOfStock,
    summary,
    valuation,
    alerts,
    pagination,
    loading,
    error,
    filters,

    // Actions
    getInventory,
    getInventoryById,
    addInventoryStock,
    removeInventoryStock,
    adjustInventoryStock,
    transferInventoryStock,
    getLowStock,
    getOutOfStock,
    getInventoryByProduct,
    getInventoryByWarehouse,
    getTransactions,
    getAllTransactions,
    getInventorySummary,
    getInventoryValuation,
    getStockAlerts,
    updateInventoryReorderLevel,
    doStockCount,
    scanInventoryCode,
    bulkUpdate,
    updateFilters,
    resetFilters,
    selectInventory,
    clearSelected,
    resetError,

    // Helpers
    isLowStock,
    isOutOfStock,
    getStockStatus,
  };
};

export default useInventory;
