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
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Close,
  Add,
  Inventory as InventoryIcon,
  QrCodeScanner,
  Category,
  Warehouse,
  CheckCircle,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import QRScanner from './QRscanner';

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

const steps = ['Select Product', 'Choose Warehouse', 'Enter Quantity', 'Confirm'];

const AddInventoryModal = ({
  open,
  onClose,
  onSubmit,
  products,
  warehouses,
  loading,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [scannerOpen, setScannerOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      productId: '',
      warehouseId: '',
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
    setActiveStep(0);
    onClose();
  };

  const handleNext = () => {
    // Validate current step
    let isValid = true;
    switch (activeStep) {
      case 0:
        if (!formik.values.productId) {
          formik.setFieldTouched('productId', true);
          isValid = false;
        }
        break;
      case 1:
        if (!formik.values.warehouseId) {
          formik.setFieldTouched('warehouseId', true);
          isValid = false;
        }
        break;
      case 2:
        if (!formik.values.quantity) {
          formik.setFieldTouched('quantity', true);
          isValid = false;
        }
        break;
    }

    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleScan = (decodedText) => {
    // Try to find product by SKU
    const product = products?.data?.find((p) => p.sku === decodedText);
    if (product) {
      formik.setFieldValue('productId', product.id);
      setActiveStep(1);
    } else {
      alert('Product not found with SKU: ' + decodedText);
    }
  };

  const selectedProduct = products?.data?.find((p) => p.id === formik.values.productId);
  const selectedWarehouse = warehouses?.data?.find(
    (w) => w.id === formik.values.warehouseId
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                select
                fullWidth
                id="productId"
                name="productId"
                label="Select Product"
                value={formik.values.productId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.productId && Boolean(formik.errors.productId)}
                helperText={formik.touched.productId && formik.errors.productId}
              >
                {products?.data?.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Category fontSize="small" />
                      <Box>
                        <Typography variant="body2">{product.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.sku} - {product.category}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                startIcon={<QrCodeScanner />}
                onClick={() => setScannerOpen(true)}
                sx={{ minWidth: 150 }}
              >
                Scan QR
              </Button>
            </Box>

            {selectedProduct && (
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {selectedProduct.name[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {selectedProduct.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        SKU: {selectedProduct.sku}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Chip label={selectedProduct.category} size="small" />
                        <Chip
                          label={`$${parseFloat(selectedProduct.unitPrice).toFixed(2)}`}
                          size="small"
                          color="success"
                        />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <TextField
              select
              fullWidth
              id="warehouseId"
              name="warehouseId"
              label="Select Warehouse"
              value={formik.values.warehouseId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.warehouseId && Boolean(formik.errors.warehouseId)}
              helperText={formik.touched.warehouseId && formik.errors.warehouseId}
              sx={{ mb: 3 }}
            >
              {warehouses?.data?.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warehouse fontSize="small" />
                    <Box>
                      <Typography variant="body2">{warehouse.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {warehouse.location} - Capacity: {warehouse.capacity}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {selectedWarehouse && (
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                      <Warehouse />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {selectedWarehouse.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedWarehouse.location}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Capacity: {selectedWarehouse.capacity} units
                      </Typography>
                      {selectedWarehouse.address && (
                        <Typography variant="caption" color="text.secondary">
                          {selectedWarehouse.address}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <TextField
              fullWidth
              id="quantity"
              name="quantity"
              label="Quantity"
              type="number"
              placeholder="Enter quantity to add"
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
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              id="notes"
              name="notes"
              label="Notes (Optional)"
              placeholder="Add any notes about this inventory"
              multiline
              rows={4}
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            {selectedProduct && formik.values.quantity && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  Total Value: ${' '}
                  <strong>
                    {(
                      parseInt(formik.values.quantity) *
                      parseFloat(selectedProduct.unitPrice)
                    ).toFixed(2)}
                  </strong>
                </Typography>
              </Alert>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
              Review your inventory details before adding
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Product
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedProduct?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      SKU: {selectedProduct?.sku}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Warehouse
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedWarehouse?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedWarehouse?.location}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Quantity
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      {formik.values.quantity}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Value
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      $
                      {(
                        parseInt(formik.values.quantity) *
                        parseFloat(selectedProduct?.unitPrice || 0)
                      ).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {formik.values.notes && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body2">{formik.values.notes}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Add color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Add Inventory
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step Content */}
            {getStepContent(activeStep)}
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Box sx={{ flex: 1 }} />
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={loading}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={formik.handleSubmit}
              disabled={loading || !formik.isValid}
              startIcon={<Add />}
            >
              {loading ? 'Adding...' : 'Add Inventory'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* QR Scanner Modal */}
      <QRScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
        title="Scan Product QR Code"
      />
    </>
  );
};

export default AddInventoryModal;
