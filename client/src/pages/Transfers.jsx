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
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material';
import {
  Add,
  MoreVert,
  SwapHoriz,
  CheckCircle,
  Cancel,
  Pending,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import Loading from '../components/common/Loading';

const Transfers = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: '',
    notes: '',
  });

  // Fetch transfers
  const { data, isLoading } = useQuery({
    queryKey: ['transfers', page, rowsPerPage],
    queryFn: async () => {
      const response = await api.get(
        `/transfers?page=${page + 1}&limit=${rowsPerPage}`
      );
      return response.data;
    },
  });

  // Fetch warehouses
  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await api.get('/warehouses');
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

  // Create transfer mutation
  const createTransferMutation = useMutation({
    mutationFn: (data) => api.post('/transfers', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['transfers']);
      enqueueSnackbar('Transfer request created', { variant: 'success' });
      handleCloseDialog();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to create transfer', {
        variant: 'error',
      });
    },
  });

  // Approve transfer mutation
  const approveTransferMutation = useMutation({
    mutationFn: (id) => api.post(`/transfers/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(['transfers']);
      enqueueSnackbar('Transfer approved', { variant: 'success' });
      handleMenuClose();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to approve transfer', {
        variant: 'error',
      });
    },
  });

  // Reject transfer mutation
  const rejectTransferMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      api.post(`/transfers/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['transfers']);
      enqueueSnackbar('Transfer rejected', { variant: 'success' });
      handleMenuClose();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to reject transfer', {
        variant: 'error',
      });
    },
  });

  // Cancel transfer mutation
  const cancelTransferMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      api.post(`/transfers/${id}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries(['transfers']);
      enqueueSnackbar('Transfer cancelled', { variant: 'success' });
      handleMenuClose();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to cancel transfer', {
        variant: 'error',
      });
    },
  });

  const handleMenuClick = (event, transfer) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransfer(transfer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      productId: '',
      fromWarehouseId: '',
      toWarehouseId: '',
      quantity: '',
      notes: '',
    });
  };

  const handleCreateTransfer = () => {
    const data = {
      ...formData,
      quantity: parseInt(formData.quantity),
    };
    createTransferMutation.mutate(data);
  };

  const handleApprove = () => {
    approveTransferMutation.mutate(selectedTransfer.id);
  };

  const handleReject = () => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      rejectTransferMutation.mutate({
        id: selectedTransfer.id,
        reason,
      });
    }
  };

  const handleCancel = () => {
    const reason = prompt('Enter cancellation reason:');
    if (reason) {
      cancelTransferMutation.mutate({
        id: selectedTransfer.id,
        reason,
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
      CANCELLED: 'default',
      COMPLETED: 'success',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <Pending fontSize="small" />,
      APPROVED: <CheckCircle fontSize="small" />,
      REJECTED: <Cancel fontSize="small" />,
      CANCELLED: <Cancel fontSize="small" />,
      COMPLETED: <CheckCircle fontSize="small" />,
    };
    return icons[status];
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
            Stock Transfers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage inter-warehouse stock transfers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          New Transfer
        </Button>
      </Box>

      {/* Transfers Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>From Warehouse</TableCell>
                <TableCell>To Warehouse</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Initiated By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data?.map((transfer) => (
                <TableRow key={transfer.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {transfer.product?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transfer.product?.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {transfer.fromWarehouse?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transfer.fromWarehouse?.location}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {transfer.toWarehouse?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transfer.toWarehouse?.location}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight={700}>
                      {transfer.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {transfer.initiatedByUser?.firstName}{' '}
                      {transfer.initiatedByUser?.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(transfer.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(transfer.status)}
                      label={transfer.status}
                      color={getStatusColor(transfer.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, transfer)}
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
        {selectedTransfer?.status === 'PENDING' && (
          <>
            <MenuItem onClick={handleApprove}>
              <CheckCircle sx={{ mr: 1 }} fontSize="small" color="success" />
              <Typography color="success.main">Approve</Typography>
            </MenuItem>
            <MenuItem onClick={handleReject}>
              <Cancel sx={{ mr: 1 }} fontSize="small" color="error" />
              <Typography color="error">Reject</Typography>
            </MenuItem>
          </>
        )}
        {(selectedTransfer?.status === 'PENDING' ||
          selectedTransfer?.status === 'APPROVED') && (
          <MenuItem onClick={handleCancel}>
            <Cancel sx={{ mr: 1 }} fontSize="small" />
            Cancel Transfer
          </MenuItem>
        )}
      </Menu>

      {/* Create Transfer Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create Stock Transfer</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={formData.productId}
                    label="Product"
                    onChange={(e) =>
                      setFormData({ ...formData, productId: e.target.value })
                    }
                  >
                    {products?.data?.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>From Warehouse</InputLabel>
                  <Select
                    value={formData.fromWarehouseId}
                    label="From Warehouse"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fromWarehouseId: e.target.value,
                      })
                    }
                  >
                    {warehouses?.data?.map((warehouse) => (
                      <MenuItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} - {warehouse.location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>To Warehouse</InputLabel>
                  <Select
                    value={formData.toWarehouseId}
                    label="To Warehouse"
                    onChange={(e) =>
                      setFormData({ ...formData, toWarehouseId: e.target.value })
                    }
                  >
                    {warehouses?.data
                      ?.filter((w) => w.id !== formData.fromWarehouseId)
                      .map((warehouse) => (
                        <MenuItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} - {warehouse.location}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTransfer}
            disabled={createTransferMutation.isPending}
          >
            Create Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transfers;
