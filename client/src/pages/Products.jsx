import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  QrCode2,
  Category,
  AttachMoney,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import Loading from '../components/common/Loading';

const Products = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    description: '',
    unitPrice: '',
    reorderLevel: '',
  });

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: async () => {
      const response = await api.get(`/products?search=${searchQuery}`);
      return response.data;
    },
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      enqueueSnackbar('Product created successfully', { variant: 'success' });
      handleCloseDialog();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to create product', {
        variant: 'error',
      });
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      enqueueSnackbar('Product updated successfully', { variant: 'success' });
      handleCloseDialog();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to update product', {
        variant: 'error',
      });
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      enqueueSnackbar('Product deleted successfully', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to delete product', {
        variant: 'error',
      });
    },
  });

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditMode(true);
      setSelectedProduct(product);
      setFormData({
        sku: product.sku,
        name: product.name,
        category: product.category,
        description: product.description || '',
        unitPrice: product.unitPrice,
        reorderLevel: product.reorderLevel,
      });
    } else {
      setEditMode(false);
      setSelectedProduct(null);
      setFormData({
        sku: '',
        name: '',
        category: '',
        description: '',
        unitPrice: '',
        reorderLevel: '',
      });
    }
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedProduct(null);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      unitPrice: parseFloat(formData.unitPrice),
      reorderLevel: parseInt(formData.reorderLevel),
    };

    if (editMode) {
      updateMutation.mutate({ id: selectedProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(selectedProduct.id);
      handleMenuClose();
    }
  };

  const handleMenuClick = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewQR = async () => {
    try {
      const response = await api.get(`/products/${selectedProduct.id}/qr-code`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedProduct.sku}-qr.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      enqueueSnackbar('QR Code downloaded', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to download QR code', { variant: 'error' });
    }
    handleMenuClose();
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
            Products Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your product inventory and details
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Product
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search products by name, SKU, or category..."
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
        </CardContent>
      </Card>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {data?.data?.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-4px)',
                },
                transition: 'all 0.3s',
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56,
                    }}
                  >
                    {product.name[0]}
                  </Avatar>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, product)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                  {product.name}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontFamily="monospace"
                  sx={{ display: 'block', mb: 1 }}
                >
                  SKU: {product.sku}
                </Typography>

                <Chip
                  label={product.category}
                  size="small"
                  sx={{ mb: 2 }}
                  icon={<Category fontSize="small" />}
                />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 2,
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Unit Price
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      ${product.unitPrice}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">
                      Reorder Level
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {product.reorderLevel}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDialog(selectedProduct)}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleViewQR}>
          <QrCode2 sx={{ mr: 1 }} fontSize="small" />
          Download QR Code
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete sx={{ mr: 1 }} fontSize="small" color="error" />
          <Typography color="error">Delete</Typography>
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              disabled={editMode}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Unit Price"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, unitPrice: e.target.value })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Reorder Level"
                  value={formData.reorderLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, reorderLevel: e.target.value })
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
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
