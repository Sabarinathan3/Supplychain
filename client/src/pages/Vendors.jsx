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
  Avatar,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Search,
  Email,
  Phone,
  LocationOn,
  Edit,
  Delete,
  MoreVert,
  Business,
  Star,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import Loading from '../components/common/Loading';

const Vendors = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    website: '',
    taxId: '',
  });

  // Fetch vendors
  const { data, isLoading } = useQuery({
    queryKey: ['vendors', searchQuery],
    queryFn: async () => {
      const response = await api.get(`/vendors?search=${searchQuery}`);
      return response.data;
    },
  });

  // Create vendor mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/vendors', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendors']);
      enqueueSnackbar('Vendor created successfully', { variant: 'success' });
      handleCloseDialog();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to create vendor', {
        variant: 'error',
      });
    },
  });

  // Update vendor mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/vendors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendors']);
      enqueueSnackbar('Vendor updated successfully', { variant: 'success' });
      handleCloseDialog();
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to update vendor', {
        variant: 'error',
      });
    },
  });

  // Delete vendor mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/vendors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendors']);
      enqueueSnackbar('Vendor deleted successfully', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to delete vendor', {
        variant: 'error',
      });
    },
  });

  const handleOpenDialog = (vendor = null) => {
    if (vendor) {
      setEditMode(true);
      setSelectedVendor(vendor);
      setFormData({
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address || '',
        contactPerson: vendor.contactPerson || '',
        website: vendor.website || '',
        taxId: vendor.taxId || '',
      });
    } else {
      setEditMode(false);
      setSelectedVendor(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
        website: '',
        taxId: '',
      });
    }
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedVendor(null);
  };

  const handleSubmit = () => {
    if (editMode) {
      updateMutation.mutate({ id: selectedVendor.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      deleteMutation.mutate(selectedVendor.id);
      handleMenuClose();
    }
  };

  const handleMenuClick = (event, vendor) => {
    setAnchorEl(event.currentTarget);
    setSelectedVendor(vendor);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
            Vendor Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your suppliers and vendors
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Vendor
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search vendors by name, email, or contact person..."
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

      {/* Vendors Grid */}
      <Grid container spacing={3}>
        {data?.data?.map((vendor) => (
          <Grid item xs={12} md={6} lg={4} key={vendor.id}>
            <Card
              sx={{
                height: '100%',
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
                      bgcolor: 'secondary.main',
                      width: 56,
                      height: 56,
                    }}
                  >
                    <Business fontSize="large" />
                  </Avatar>
                  <Box>
                    {vendor.isActive && (
                      <Chip label="Active" color="success" size="small" sx={{ mb: 1 }} />
                    )}
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, vendor)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>

                {/* Vendor Name */}
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {vendor.name}
                </Typography>

                {/* Contact Person */}
                {vendor.contactPerson && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Contact: {vendor.contactPerson}
                  </Typography>
                )}

                {/* Contact Details */}
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2" noWrap>
                      {vendor.email}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2">{vendor.phone}</Typography>
                  </Box>

                  {vendor.address && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" noWrap>
                        {vendor.address}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Stats */}
                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Orders
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {vendor._count?.orders || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">
                      Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star fontSize="small" color="warning" />
                      <Typography variant="h6" fontWeight={700}>
                        4.5
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleOpenDialog(selectedVendor)}>
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
        <DialogTitle>{editMode ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vendor Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax ID"
                  value={formData.taxId}
                  onChange={(e) =>
                    setFormData({ ...formData, taxId: e.target.value })
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

export default Vendors;
