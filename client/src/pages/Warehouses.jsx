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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Add,
  Warehouse as WarehouseIcon,
  LocationOn,
  Inventory,
  Edit,
  Delete,
  MoreVert,
  TrendingUp,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import Loading from '../components/common/Loading';

const Warehouses = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    capacity: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
  });

  // Fetch warehouses
  const { data, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await api.get('/warehouses');
      return response.data;
    },
  });

  // Create warehouse mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/warehouses', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      enqueueSnackbar('Warehouse created successfully', { variant: 'success' });
      handleCloseDialog();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to create warehouse', {
        variant: 'error',
      });
    },
  });

  // Update warehouse mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/warehouses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      enqueueSnackbar('Warehouse updated successfully', { variant: 'success' });
      handleCloseDialog();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to update warehouse', {
        variant: 'error',
      });
    },
  });

  // Delete warehouse mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/warehouses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      enqueueSnackbar('Warehouse deleted successfully', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to delete warehouse', {
        variant: 'error',
      });
    },
  });

  const handleOpenDialog = (warehouse = null) => {
    if (warehouse) {
      setEditMode(true);
      setSelectedWarehouse(warehouse);
      setFormData({
        name: warehouse.name,
        location: warehouse.location,
        address: warehouse.address || '',
        capacity: warehouse.capacity,
        contactPerson: warehouse.contactPerson || '',
        contactPhone: warehouse.contactPhone || '',
        contactEmail: warehouse.contactEmail || '',
      });
    } else {
      setEditMode(false);
      setSelectedWarehouse(null);
      setFormData({
        name: '',
        location: '',
        address: '',
        capacity: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
      });
    }
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedWarehouse(null);
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      capacity: parseInt(formData.capacity),
    };

    if (editMode) {
      updateMutation.mutate({ id: selectedWarehouse.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      deleteMutation.mutate(selectedWarehouse.id);
      handleMenuClose();
    }
  };

  const handleMenuClick = (event, warehouse) => {
    setAnchorEl(event.currentTarget);
    setSelectedWarehouse(warehouse);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const calculateUtilization = (current, capacity) => {
    return capacity > 0 ? ((current / capacity) * 100).toFixed(1) : 0;
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
            Warehouse Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and manage all warehouse locations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Warehouse
        </Button>
      </Box>

      {/* Warehouses Grid */}
      <Grid container spacing={3}>
        {data?.data?.map((warehouse) => {
          const utilization = calculateUtilization(
            warehouse._count?.inventory || 0,
            warehouse.capacity
          );
          const isHighUtilization = utilization > 80;

          return (
            <Grid item xs={12} md={6} lg={4} key={warehouse.id}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                <CardContent>
                  {/* Header */}
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
                      <WarehouseIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      {warehouse.isActive && (
                        <Chip
                          label="Active"
                          color="success"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, warehouse)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Name & Location */}
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {warehouse.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {warehouse.location}
                    </Typography>
                  </Box>

                  {/* Capacity Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Capacity Utilization
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color={isHighUtilization ? 'error.main' : 'text.primary'}
                      >
                        {utilization}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(utilization)}
                      color={isHighUtilization ? 'error' : 'primary'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Stats */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: 'background.default',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Total Capacity
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {warehouse.capacity}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: 'background.default',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Items Stored
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {warehouse._count?.inventory || 0}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Contact Info */}
                  {warehouse.contactPerson && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary">
                        Contact: {warehouse.contactPerson}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDialog(selectedWarehouse)}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete sx={{ mr: 1 }} fontSize="small" color="error" />
          <Typography color="error">Delete</Typography>
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Warehouse' : 'Add New Warehouse'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Warehouse Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Capacity"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Contact Email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
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

export default Warehouses;
