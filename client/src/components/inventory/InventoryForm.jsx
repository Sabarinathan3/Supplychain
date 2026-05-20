import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Divider,
  InputAdornment,
  MenuItem,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Close,
  Save,
  Inventory as InventoryIcon,
  Add,
  Remove,
  SwapHoriz,
  Edit,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  productId: yup.string().required('Product is required'),
  warehouseId: yup.string().required('Warehouse is required'),
  quantity: yup
    .number()
    .integer('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .required('Quantity is required'),
  notes: yup.string(),
});

const InventoryForm = ({
  open,
  onClose,
  onSubmit,
  products,
  warehouses,
  loading,
  type = 'add', // 'add', 'remove', 'adjust', 'transfer'
  inventory,
}) => {
  const getTitle = () => {
    switch (type) {
      case 'add':
        return 'Add Stock';
      case 'remove':
        return 'Remove Stock';
      case 'adjust':
        return 'Adjust Stock';
      case 'transfer':
        return 'Transfer Stock';
      default:
        return 'Manage Inventory';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'add':
        return <Add />;
      case 'remove':
        return <Remove />;
      case 'adjust':
        return <Edit />;
      case 'transfer':
        return <SwapHoriz />;
      default:
        return <InventoryIcon />;
    }
  };

  const formik = useFormik({
    initialValues: {
      productId: inventory?.productId || '',
      warehouseId: inventory?.warehouseId || '',
      toWarehouseId: '',
      quantity: '',
      notes: '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const currentStock = inventory?.quantity || 0;
  const newStock =
    type === 'add'
      ? currentStock + (parseInt(formik.values.quantity) || 0)
      : type === 'remove'
      ? currentStock - (parseInt(formik.values.quantity) || 0)
      : parseInt(formik.values.quantity) || 0;

  const selectedProduct = products?.data?.find((p) => p.id === formik.values.productId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getIcon()}
            <Typography variant="h6" fontWeight={600}>
              {getTitle()}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Info Alert */}
            {type === 'remove' && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                You are removing stock. Make sure you have the correct quantity.
              </Alert>
            )}

            {type === 'adjust' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Enter the new total quantity for this inventory item.
              </Alert>
            )}

            <Grid container spacing={2}>
              {/* Product Selection */}
              {type === 'add' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Product</InputLabel>
                    <Select
                      id="productId"
                      name="productId"
                      value={formik.values.productId}
                      label="Product"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.productId && Boolean(formik.errors.productId)}
                    >
                      {products?.data?.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.productId && formik.errors.productId && (
                      <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                        {formik.errors.productId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              )}

              {/* Current Product Info (for edit/remove) */}
              {(type === 'remove' || type === 'adjust') && inventory && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {inventory.product?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      SKU: {inventory.product?.sku}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Current Stock: <strong>{currentStock}</strong>
                    </Typography>
                  </Box>
                </Grid>
              )}

              {/* Warehouse Selection */}
              {(type === 'add' || type === 'transfer') && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>
                      {type === 'transfer' ? 'From Warehouse' : 'Warehouse'}
                    </InputLabel>
                    <Select
                      id="warehouseId"
                      name="warehouseId"
                      value={formik.values.warehouseId}
                      label={type === 'transfer' ? 'From Warehouse' : 'Warehouse'}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.warehouseId && Boolean(formik.errors.warehouseId)}
                    >
                      {warehouses?.data?.map((warehouse) => (
                        <MenuItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} - {warehouse.location}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.warehouseId && formik.errors.warehouseId && (
                      <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                        {formik.errors.warehouseId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              )}

              {/* To Warehouse (for transfer) */}
              {type === 'transfer' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>To Warehouse</InputLabel>
                    <Select
                      id="toWarehouseId"
                      name="toWarehouseId"
                      value={formik.values.toWarehouseId}
                      label="To Warehouse"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {warehouses?.data
                        ?.filter((w) => w.id !== formik.values.warehouseId)
                        .map((warehouse) => (
                          <MenuItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} - {warehouse.location}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Quantity */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="quantity"
                  name="quantity"
                  label={type === 'adjust' ? 'New Total Quantity' : 'Quantity'}
                  type="number"
                  placeholder="Enter quantity"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                  helperText={formik.touched.quantity && formik.errors.quantity}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <InventoryIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Stock Preview */}
              {(type === 'add' || type === 'remove') && formik.values.quantity && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: newStock < 0 ? 'error.light' : 'success.light',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Stock Preview
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2">
                        Current: <strong>{currentStock}</strong>
                      </Typography>
                      <Typography variant="body2">
                        {type === 'add' ? '→' : '→'}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={newStock < 0 ? 'error.main' : 'success.main'}
                      >
                        New: <strong>{newStock}</strong>
                      </Typography>
                    </Box>
                    {newStock < 0 && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        Warning: Insufficient stock for this operation
                      </Typography>
                    )}
                  </Box>
                </Grid>
              )}

              {/* Reorder Level Warning */}
              {selectedProduct && formik.values.quantity && (
                <Grid item xs={12}>
                  {newStock <= selectedProduct.reorderLevel && (
                    <Alert severity="warning" icon={<Remove />}>
                      Stock will be at or below reorder level ({selectedProduct.reorderLevel})
                    </Alert>
                  )}
                </Grid>
              )}

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Notes (Optional)"
                  placeholder="Add any additional notes"
                  multiline
                  rows={3}
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={loading || !formik.isValid || (type === 'remove' && newStock < 0)}
            color={type === 'remove' ? 'error' : 'primary'}
          >
            {loading ? 'Processing...' : getTitle()}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InventoryForm;
