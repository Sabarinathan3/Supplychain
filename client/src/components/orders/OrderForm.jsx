import React, { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import {
  Close,
  Save,
  ShoppingCart,
  Add,
  Delete,
  Person,
  Warehouse,
  CalendarToday,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const validationSchema = yup.object({
  vendorId: yup.string().required('Vendor is required'),
  warehouseId: yup.string().required('Warehouse is required'),
  orderDate: yup.date().required('Order date is required'),
  deliveryDate: yup.date().min(yup.ref('orderDate'), 'Delivery date must be after order date'),
  items: yup.array().min(1, 'At least one item is required'),
});

const OrderForm = ({
  open,
  onClose,
  onSubmit,
  order,
  vendors,
  warehouses,
  products,
  loading,
}) => {
  const isEditMode = Boolean(order);
  const [orderItems, setOrderItems] = useState(order?.items || []);

  const formik = useFormik({
    initialValues: {
      vendorId: order?.vendorId || '',
      warehouseId: order?.warehouseId || '',
      orderDate: order?.orderDate ? new Date(order.orderDate) : new Date(),
      deliveryDate: order?.deliveryDate ? new Date(order.deliveryDate) : null,
      notes: order?.notes || '',
      items: order?.items || [],
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit({ ...values, items: orderItems });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setOrderItems([]);
    onClose();
  };

  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      { productId: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveItem = (index) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;

    // Auto-fill unit price when product is selected
    if (field === 'productId') {
      const product = products?.data?.find((p) => p.id === value);
      if (product) {
        newItems[index].unitPrice = parseFloat(product.unitPrice);
      }
    }

    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCart color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {isEditMode ? 'Edit Order' : 'Create New Order'}
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
            {/* Order Information */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="primary">
              Order Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  id="vendorId"
                  name="vendorId"
                  label="Vendor"
                  value={formik.values.vendorId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.vendorId && Boolean(formik.errors.vendorId)}
                  helperText={formik.touched.vendorId && formik.errors.vendorId}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {vendors?.data?.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.name} - {vendor.email}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  id="warehouseId"
                  name="warehouseId"
                  label="Warehouse"
                  value={formik.values.warehouseId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.warehouseId && Boolean(formik.errors.warehouseId)}
                  helperText={formik.touched.warehouseId && formik.errors.warehouseId}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Warehouse fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {warehouses?.data?.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} - {warehouse.location}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Order Date"
                    value={formik.values.orderDate}
                    onChange={(value) => formik.setFieldValue('orderDate', value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.orderDate && Boolean(formik.errors.orderDate)}
                        helperText={formik.touched.orderDate && formik.errors.orderDate}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Expected Delivery Date"
                    value={formik.values.deliveryDate}
                    onChange={(value) => formik.setFieldValue('deliveryDate', value)}
                    minDate={formik.values.orderDate}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={formik.touched.deliveryDate && Boolean(formik.errors.deliveryDate)}
                        helperText={formik.touched.deliveryDate && formik.errors.deliveryDate}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Notes (Optional)"
                  placeholder="Add any notes about this order"
                  multiline
                  rows={2}
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Order Items */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} color="primary">
                Order Items
              </Typography>
              <Button
                startIcon={<Add />}
                variant="outlined"
                size="small"
                onClick={handleAddItem}
              >
                Add Item
              </Button>
            </Box>

            {orderItems.length === 0 ? (
              <Alert severity="info">
                No items added yet. Click "Add Item" to start building your order.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems.map((item, index) => {
                      const product = products?.data?.find((p) => p.id === item.productId);
                      const itemTotal = item.quantity * item.unitPrice;

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              value={item.productId}
                              onChange={(e) =>
                                handleItemChange(index, 'productId', e.target.value)
                              }
                            >
                              {products?.data?.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                  {product.name} ({product.sku})
                                </MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                              }
                              inputProps={{ min: 1 }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                              }
                              inputProps={{ min: 0, step: 0.01 }}
                              sx={{ width: 100 }}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>
                              ${itemTotal.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {/* Total Row */}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="subtitle1" fontWeight={700}>
                          Total Amount:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight={700} color="success.main">
                          ${calculateTotal().toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
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
            disabled={loading || !formik.isValid || orderItems.length === 0}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Order' : 'Create Order'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OrderForm;
