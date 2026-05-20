import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Search, LocalShipping } from '@mui/icons-material';
import api from '../services/api';
import Loading from '../components/common/Loading';

const Deliveries = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch deliveries
  const { data, isLoading } = useQuery({
    queryKey: ['deliveries', page, rowsPerPage, searchQuery],
    queryFn: async () => {
      const response = await api.get(
        `/deliveries?page=${page + 1}&limit=${rowsPerPage}&search=${searchQuery}`
      );
      return response.data;
    },
  });

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      IN_TRANSIT: 'info',
      DELIVERED: 'success',
      FAILED: 'error',
    };
    return colors[status] || 'default';
  };

  const getDeliverySteps = (status) => {
    const steps = ['Pending', 'In Transit', 'Delivered'];
    const activeStep =
      status === 'DELIVERED' ? 2 : status === 'IN_TRANSIT' ? 1 : 0;
    return { steps, activeStep };
  };

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setOpenDialog(true);
  };

  if (isLoading) return <Loading />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Delivery Tracking
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor delivery status and tracking information
        </Typography>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by tracking number or order number..."
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
      </Card>

      {/* Deliveries Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tracking Number</TableCell>
                <TableCell>Order Number</TableCell>
                <TableCell>Carrier</TableCell>
                <TableCell>Shipped Date</TableCell>
                <TableCell>Estimated Delivery</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.data?.map((delivery) => (
                <TableRow key={delivery.id} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      fontFamily="monospace"
                    >
                      {delivery.trackingNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {delivery.order?.orderNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalShipping fontSize="small" color="action" />
                      <Typography variant="body2">
                        {delivery.carrier || 'Standard'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {delivery.shippedDate
                        ? new Date(delivery.shippedDate).toLocaleDateString()
                        : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {delivery.estimatedDelivery
                        ? new Date(delivery.estimatedDelivery).toLocaleDateString()
                        : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={delivery.status}
                      color={getStatusColor(delivery.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleViewDetails(delivery)}
                    >
                      Track
                    </Button>
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

      {/* Delivery Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Delivery Tracking</DialogTitle>
        <DialogContent>
          {selectedDelivery && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedDelivery.trackingNumber}
              </Typography>

              <Box sx={{ my: 4 }}>
                <Stepper
                  activeStep={
                    getDeliverySteps(selectedDelivery.status).activeStep
                  }
                  alternativeLabel
                >
                  {getDeliverySteps(selectedDelivery.status).steps.map(
                    (label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    )
                  )}
                </Stepper>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Delivery Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Order: {selectedDelivery.order?.orderNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Carrier: {selectedDelivery.carrier || 'Standard'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Shipped:{' '}
                  {selectedDelivery.shippedDate
                    ? new Date(selectedDelivery.shippedDate).toLocaleDateString()
                    : 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estimated Delivery:{' '}
                  {selectedDelivery.estimatedDelivery
                    ? new Date(
                        selectedDelivery.estimatedDelivery
                      ).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Deliveries;
