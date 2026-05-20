import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Visibility,
  Edit,
  Cancel,
  CheckCircle,
  LocalShipping,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import Loading from '../components/common/Loading';

const Orders = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [orderItems, setOrderItems] = useState([
    { productId: '', quantity: '', unitPrice: '' },
  ]);
  const [formData, setFormData] = useState({
    vendorId: '',
    expectedDelivery: '',
    notes: '',
  });

  // Fetch orders
  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, rowsPerPage],
    queryFn: async () => {
      const response = await api.get(
        `/orders?page=${page + 1}&limit=${rowsPerPage}`
      );
      return response.data;
    },
  });

  // Fetch vendors
  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await api.get('/vendors');
      return response.data;
    },
  });

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data;
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (data) => api.post('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      enqueueSnackbar('Order created successfully', { variant: 'success' });
      setOpenCreateDialog(false);
      resetForm();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to create order', {
        variant: 'error',
      });
    },
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      enqueueSnackbar('Order status updated', { variant: 'success' });
      handleMenuClose();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to update status', {
        variant: 'error',
      });
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      api.post(`/orders/${id}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      enqueueSnackbar('Order cancelled', { variant: 'success' });
      handleMenuClose();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to cancel order', {
        variant: 'error',
      });
    },
  });

  const handleMenuClick = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleUpdateStatus = (status) => {
    updateStatusMutation.mutate({
      id: selectedOrder.id,
      status,
    });
  };

  const handleCancelOrder = () => {
    const reason = prompt('Enter cancellation reason:');
    if (reason) {
      cancelOrderMutation.mutate({
        id: selectedOrder.id,
        reason,
      });
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: '', unitPrice: '' }]);
  };

  const removeOrderItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const handleCreateOrder = () => {
    const data = {
      ...formData,
      orderItems: orderItems.map((item) => ({
        productId: item.productId,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
      })),
    };
    createOrderMutation.mutate(data);
  };

  const resetForm = () => {
    setFormData({
      vendorId: '',
      expectedDelivery: '',
      notes: '',
    });
    setOrderItems([{ productId: '', quantity: '', unitPrice: '' }]);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      SHIPPED: 'primary',
      DELIVERED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  };

  if (isLoading) return <Loading />;

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Order Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage all purchase orders
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Order
        </Button>
      </Box>

      {/* Orders Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Number</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Expected Delivery</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data?.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                      {order.orderNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.vendor?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.vendor?.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.expectedDelivery
                        ? new Date(order.expectedDelivery).toLocaleDateString()
                        : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, order)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={data?.pagination?.total || 0}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value));
            setPage(0);
          }}
        />
      </Card>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleViewDetails}>
          <Visibility sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        {selectedOrder?.status === 'PENDING' && (
          <MenuItem onClick={() => handleUpdateStatus('CONFIRMED')}>
            <CheckCircle sx={{ mr: 1 }} fontSize="small" />
            Confirm Order
          </MenuItem>
        )}
        {selectedOrder?.status === 'CONFIRMED' && (
          <MenuItem onClick={() => handleUpdateStatus('SHIPPED')}>
            <LocalShipping sx={{ mr: 1 }} fontSize="small" />
            Mark as Shipped
          </MenuItem>
        )}
        {selectedOrder?.status !== 'CANCELLED' &&
          selectedOrder?.status !== 'DELIVERED' && (
            <MenuItem onClick={handleCancelOrder}>
              <Cancel sx={{ mr: 1 }} fontSize="small" color="error" />
              <Typography color="error">Cancel Order</Typography>
            </MenuItem>
          )}
      </Menu>

      {/* Order Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Order Number
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedOrder.orderNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box>
                    <Chip
                      label={selectedOrder.status}
                      color={getStatusColor(selectedOrder.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Vendor
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.vendor?.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    ${parseFloat(selectedOrder.totalAmount).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
                Order Items
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.orderItems?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product?.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          ${parseFloat(item.unitPrice).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ${parseFloat(item.subtotal).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Order Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Vendor</InputLabel>
                  <Select
                    value={formData.vendorId}
                    label="Vendor"
                    onChange={(e) =>
                      setFormData({ ...formData, vendorId: e.target.value })
                    }
                  >
                    {vendors?.data?.map((vendor) => (
                      <MenuItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Expected Delivery"
                  value={formData.expectedDelivery}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedDelivery: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Order Items
                </Typography>
                {orderItems.map((item, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                    <Grid item xs={5}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Product</InputLabel>
                        <Select
                          value={item.productId}
                          label="Product"
                          onChange={(e) =>
                            updateOrderItem(index, 'productId', e.target.value)
                          }
                        >
                          {products?.data?.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Quantity"
                        value={item.quantity}
                        onChange={(e) =>
                          updateOrderItem(index, 'quantity', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateOrderItem(index, 'unitPrice', e.target.value)
                        }
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeOrderItem(index)}
                        disabled={orderItems.length === 1}
                      >
                        <Cancel />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button size="small" onClick={addOrderItem}>
                  + Add Item
                </Button>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateOrder}
            disabled={createOrderMutation.isPending}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
