import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ShoppingCart,
  Person,
  Warehouse,
  LocalShipping,
  CheckCircle,
  Schedule,
  AttachMoney,
  CalendarToday,
  Note,
  Inventory,
} from '@mui/icons-material';

const OrderDetails = ({ order }) => {
  const getStatusConfig = (status) => {
    const configs = {
      PENDING: { color: 'warning', icon: <Schedule />, label: 'Pending' },
      CONFIRMED: { color: 'info', icon: <CheckCircle />, label: 'Confirmed' },
      PROCESSING: { color: 'primary', icon: <ShoppingCart />, label: 'Processing' },
      SHIPPED: { color: 'secondary', icon: <LocalShipping />, label: 'Shipped' },
      DELIVERED: { color: 'success', icon: <CheckCircle />, label: 'Delivered' },
      CANCELLED: { color: 'error', icon: <CheckCircle />, label: 'Cancelled' },
    };
    return configs[status] || configs.PENDING;
  };

  const statusConfig = getStatusConfig(order.status);

  const orderSteps = [
    { label: 'Order Placed', status: 'PENDING', date: order.createdAt },
    { label: 'Confirmed', status: 'CONFIRMED', date: order.confirmedAt },
    { label: 'Processing', status: 'PROCESSING', date: order.processingAt },
    { label: 'Shipped', status: 'SHIPPED', date: order.shippedAt },
    { label: 'Delivered', status: 'DELIVERED', date: order.deliveredAt },
  ];

  const getActiveStep = () => {
    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    return statusOrder.indexOf(order.status);
  };

  const totalAmount = order.totalAmount ||
    order.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Main Info Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: statusConfig.color + '.main',
                    width: 64,
                    height: 64,
                  }}
                >
                  <ShoppingCart fontSize="large" />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={700}>
                    Order #{order.orderNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created on {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Chip
                  icon={statusConfig.icon}
                  label={statusConfig.label}
                  color={statusConfig.color}
                  size="large"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Order Timeline */}
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Order Timeline
              </Typography>
              <Stepper activeStep={getActiveStep()} orientation="vertical">
                {orderSteps.map((step, index) => (
                  <Step key={step.label} completed={index < getActiveStep()}>
                    <StepLabel>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {step.label}
                        </Typography>
                        {step.date && (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(step.date).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Divider sx={{ my: 3 }} />

              {/* Order Items */}
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Order Items
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">SKU</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items?.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                              {item.product?.name?.[0]}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600}>
                              {item.product?.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption" fontFamily="monospace">
                            {item.product?.sku}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{item.quantity}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ${parseFloat(item.unitPrice).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            ${(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        <Typography variant="h6" fontWeight={700}>
                          Total Amount:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight={700} color="success.main">
                          ${parseFloat(totalAmount).toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Side Info Cards */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {/* Customer Info */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Customer Information
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List>
                    <ListItem disablePadding sx={{ mb: 2 }}>
                      <ListItemIcon>
                        <Person color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Name"
                        secondary={order.vendor?.name || 'N/A'}
                        primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Warehouse Info */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Warehouse
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'secondary.light' }}>
                      <Warehouse />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {order.warehouse?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.warehouse?.location}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Delivery Info */}
            {order.deliveryDate && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Delivery
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Expected Delivery
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Notes */}
            {order.notes && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Note color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Notes
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {order.notes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderDetails;
