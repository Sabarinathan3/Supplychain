import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  Switch,
  IconButton,
} from '@mui/material';
import {
  Warehouse,
  LocationOn,
  Person,
  Phone,
  Email,
  Close,
  Save,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  name: yup
    .string()
    .min(3, 'Warehouse name must be at least 3 characters')
    .required('Warehouse name is required'),
  location: yup.string().required('Location is required'),
  capacity: yup
    .number()
    .positive('Capacity must be positive')
    .integer('Capacity must be an integer')
    .required('Capacity is required'),
  address: yup.string(),
  contactPerson: yup.string(),
  contactPhone: yup
    .string()
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number'),
  contactEmail: yup.string().email('Invalid email address'),
});

const WarehouseForm = ({ open, onClose, onSubmit, warehouse, loading }) => {
  const isEditMode = Boolean(warehouse);

  const formik = useFormik({
    initialValues: {
      name: warehouse?.name || '',
      location: warehouse?.location || '',
      address: warehouse?.address || '',
      capacity: warehouse?.capacity || '',
      contactPerson: warehouse?.contactPerson || '',
      contactPhone: warehouse?.contactPhone || '',
      contactEmail: warehouse?.contactEmail || '',
      isActive: warehouse?.isActive ?? true,
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warehouse color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {isEditMode ? 'Edit Warehouse' : 'Add New Warehouse'}
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
            {/* Basic Information */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="primary">
              Basic Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Warehouse Name"
                  placeholder="Enter warehouse name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Warehouse fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="location"
                  name="location"
                  label="Location"
                  placeholder="City, State"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  label="Full Address"
                  placeholder="Street, City, State, ZIP"
                  multiline
                  rows={2}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="capacity"
                  name="capacity"
                  label="Storage Capacity"
                  type="number"
                  placeholder="Maximum items"
                  value={formik.values.capacity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                  helperText={formik.touched.capacity && formik.errors.capacity}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">items</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        id="isActive"
                        name="isActive"
                        checked={formik.values.isActive}
                        onChange={formik.handleChange}
                        color="success"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {formik.values.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    }
                  />
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Contact Information */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="primary">
              Contact Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="contactPerson"
                  name="contactPerson"
                  label="Contact Person"
                  placeholder="Manager name"
                  value={formik.values.contactPerson}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.contactPerson && Boolean(formik.errors.contactPerson)}
                  helperText={formik.touched.contactPerson && formik.errors.contactPerson}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="contactPhone"
                  name="contactPhone"
                  label="Contact Phone"
                  placeholder="+1 (555) 123-4567"
                  value={formik.values.contactPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.contactPhone && Boolean(formik.errors.contactPhone)}
                  helperText={formik.touched.contactPhone && formik.errors.contactPhone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="contactEmail"
                  name="contactEmail"
                  label="Contact Email"
                  type="email"
                  placeholder="warehouse@company.com"
                  value={formik.values.contactEmail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.contactEmail && Boolean(formik.errors.contactEmail)}
                  helperText={formik.touched.contactEmail && formik.errors.contactEmail}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
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
            disabled={loading || !formik.isValid}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Warehouse' : 'Create Warehouse'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default WarehouseForm;
