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
  Avatar,
  Chip,
} from '@mui/material';
import {
  Close,
  Save,
  QrCode2,
  Category,
  AttachMoney,
  Inventory,
  Description,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { PRODUCT_CATEGORIES } from '../../utils/constants';

const validationSchema = yup.object({
  sku: yup
    .string()
    .matches(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens')
    .required('SKU is required'),
  name: yup
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .required('Product name is required'),
  category: yup.string().required('Category is required'),
  unitPrice: yup
    .number()
    .positive('Unit price must be positive')
    .required('Unit price is required'),
  reorderLevel: yup
    .number()
    .integer('Reorder level must be an integer')
    .min(0, 'Reorder level cannot be negative')
    .required('Reorder level is required'),
  description: yup.string(),
});

const ProductForm = ({ open, onClose, onSubmit, product, loading }) => {
  const isEditMode = Boolean(product);
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || null);

  const formik = useFormik({
    initialValues: {
      sku: product?.sku || '',
      name: product?.name || '',
      category: product?.category || '',
      description: product?.description || '',
      unitPrice: product?.unitPrice || '',
      reorderLevel: product?.reorderLevel || '',
      image: null,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setImagePreview(null);
    onClose();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      formik.setFieldValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Inventory color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {isEditMode ? 'Edit Product' : 'Add New Product'}
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
            {/* Product Image */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="product-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="product-image-upload">
                <Box
                  sx={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {imagePreview ? (
                    <Avatar
                      src={imagePreview}
                      sx={{
                        width: 120,
                        height: 120,
                        mb: 1,
                        border: '3px solid',
                        borderColor: 'primary.main',
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        mb: 1,
                        bgcolor: 'primary.light',
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 60 }} />
                    </Avatar>
                  )}
                  <Chip
                    label="Upload Image"
                    color="primary"
                    size="small"
                    icon={<ImageIcon />}
                  />
                </Box>
              </label>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Basic Information */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="primary">
              Basic Information
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="sku"
                  name="sku"
                  label="SKU"
                  placeholder="e.g., PROD-001"
                  value={formik.values.sku}
                  onChange={(e) => {
                    formik.setFieldValue('sku', e.target.value.toUpperCase());
                  }}
                  onBlur={formik.handleBlur}
                  error={formik.touched.sku && Boolean(formik.errors.sku)}
                  helperText={formik.touched.sku && formik.errors.sku}
                  disabled={isEditMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCode2 fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  id="category"
                  name="category"
                  label="Category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Category fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Product Name"
                  placeholder="Enter product name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  placeholder="Enter product description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Pricing & Inventory */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="primary">
              Pricing & Inventory
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="unitPrice"
                  name="unitPrice"
                  label="Unit Price"
                  type="number"
                  placeholder="0.00"
                  value={formik.values.unitPrice}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.unitPrice && Boolean(formik.errors.unitPrice)}
                  helperText={formik.touched.unitPrice && formik.errors.unitPrice}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="reorderLevel"
                  name="reorderLevel"
                  label="Reorder Level"
                  type="number"
                  placeholder="Minimum stock quantity"
                  value={formik.values.reorderLevel}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.reorderLevel && Boolean(formik.errors.reorderLevel)}
                  helperText={formik.touched.reorderLevel && formik.errors.reorderLevel}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">units</InputAdornment>
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
            {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductForm;
