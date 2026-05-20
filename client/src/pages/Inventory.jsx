import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
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
  Grid,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
  QrCode,
  FilterList,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import Loading from '../components/common/Loading';

const Inventory = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // add, remove, adjust
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    quantity: '',
    notes: '',
  });

  // Fetch inventory data
  const { data, isLoading } = useQuery({
    queryKey: ['inventory', page, rowsPerPage, searchQuery],
    queryFn: async () => {
      const response = await api.get(
        `/inventory?page=${page + 1}&limit=${rowsPerPage}&search=${searchQuery}`
      );
      return response.data;
    },
  });

  // Fetch warehouses for dropdown
  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await api.get('/warehouses');
      return response.data;
    },
  });

  // Fetch products for dropdown
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data;
    },
  });

  // Add stock mutation
  const addStockMutation = useMutation({
    mutationFn: (data) => api.post('/inventory/add', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      enqueueSnackbar('Stock added successfully', { variant: 'success' });
      handleCloseDialog();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to add stock', { variant: 'error' });
    },
  });

  // Remove stock mutation
  const removeStockMutation = useMutation({
    mutationFn: (data) => api.post('/inventory/remove', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      enqueueSnackbar('Stock removed successfully', { variant: 'success' });
      handleCloseDialog();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to remove stock', { variant: 'error' });
    },
  });

  // Adjust stock mutation
  const adjustStockMutation = useMutation({
    mutationFn: (data) => api.post('/inventory/adjust', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      enqueueSnackbar('Stock adjusted successfully', { variant: 'success' });
      handleCloseDialog();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to adjust stock', { variant: 'error' });
    },
  });

  const handleMenuClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
    handleMenuClose();
    
    if (type !== 'add' && selectedItem) {
      setFormData({
        inventoryId: selectedItem.id,
        productId: selectedItem.productId,
        warehouseId: selectedItem.warehouseId,
        quantity: '',
        notes: '',
      });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      productId: '',
      warehouseId: '',
      quantity: '',
      notes: '',
    });
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      quantity: parseInt(formData.quantity),
    };

    if (dialogType === 'add') {
      addStockMutation.mutate(data);
    } else if (dialogType === 'remove') {
      removeStockMutation.mutate(data);
    } else if (dialogType === 'adjust') {
      adjustStockMutation.mutate(data);
    }
  };

  const getStockStatus = (quantity, reorderLevel) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'error' };
    if (quantity <= reorderLevel) return { label: 'Low Stock', color: 'warning' };
    return { label: 'In Stock', color: 'success' };
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
            Inventory Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage your inventory across all warehouses
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog('add')}
          sx={{ height: 'fit-content' }}
        >
          Add Stock
        </Button>
      </Box>

      {/* Filters & Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by product name, SKU, or warehouse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button startIcon={<FilterList />} variant="outlined">
                  Filters
                </Button>
                <Button startIcon={<QrCode />} variant="outlined">
                  Scan QR
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Warehouse</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Reorder Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data?.map((item) => {
                const status = getStockStatus(
                  item.quantity,
                  item.product?.reorderLevel
                );
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {item.product?.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {item.product?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.product?.category}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {item.product?.sku}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {item.warehouse?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.warehouse?.location}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" fontWeight={700}>
                        {item.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {item.product?.reorderLevel}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, item)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
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
        <MenuItem onClick={() => handleOpenDialog('add')}>
          <TrendingUp sx={{ mr: 1 }} fontSize="small" />
          Add Stock
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog('remove')}>
          <TrendingDown sx={{ mr: 1 }} fontSize="small" />
          Remove Stock
        </MenuItem>
        <MenuItem onClick={() => handleOpenDialog('adjust')}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Adjust Stock
        </MenuItem>
      </Menu>

      {/* Add/Remove/Adjust Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'add' && 'Add Stock'}
          {dialogType === 'remove' && 'Remove Stock'}
          {dialogType === 'adjust' && 'Adjust Stock'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {dialogType === 'add' && (
              <>
                <TextField
                  select
                  fullWidth
                  label="Product"
                  value={formData.productId}
                  onChange={(e) =>
                    setFormData({ ...formData, productId: e.target.value })
                  }
                  sx={{ mb: 2 }}
                >
                  {products?.data?.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Warehouse"
                  value={formData.warehouseId}
                  onChange={(e) =>
                    setFormData({ ...formData, warehouseId: e.target.value })
                  }
                  sx={{ mb: 2 }}
                >
                  {warehouses?.data?.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} - {warehouse.location}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}

            <TextField
              fullWidth
              type="number"
              label="Quantity"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              sx={{ mb: 2 }}
            />

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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              addStockMutation.isPending ||
              removeStockMutation.isPending ||
              adjustStockMutation.isPending
            }
          >
            {dialogType === 'add' && 'Add Stock'}
            {dialogType === 'remove' && 'Remove Stock'}
            {dialogType === 'adjust' && 'Adjust Stock'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;
