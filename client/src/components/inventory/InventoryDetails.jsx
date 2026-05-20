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
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warehouse,
  Category,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  QrCode2,
  History,
} from '@mui/icons-material';

const InventoryDetails = ({ inventory }) => {
  const getStockStatus = () => {
    const { quantity } = inventory;
    const reorderLevel = inventory.product?.reorderLevel || 0;

    if (quantity === 0) {
      return { label: 'Out of Stock', color: 'error', icon: <Warning /> };
    }
    if (quantity <= reorderLevel) {
      return { label: 'Low Stock', color: 'warning', icon: <TrendingDown /> };
    }
    return { label: 'In Stock', color: 'success', icon: <CheckCircle /> };
  };

  const stockStatus = getStockStatus();
  const reorderLevel = inventory.product?.reorderLevel || 0;
  const stockPercentage = reorderLevel > 0 
    ? Math.min((inventory.quantity / (reorderLevel * 2)) * 100, 100)
    : 100;
  const inventoryValue = inventory.quantity * parseFloat(inventory.product?.unitPrice || 0);

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
                    bgcolor: stockStatus.color + '.main',
                    width: 64,
                    height: 64,
                  }}
                >
                  <InventoryIcon fontSize="large" />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {inventory.product?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <QrCode2 fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                      {inventory.product?.sku}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  icon={stockStatus.icon}
                  label={stockStatus.label}
                  color={stockStatus.color}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Product Details */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Category fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Category
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {inventory.product?.category}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney fontSize="small" color="success" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Unit Price
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        ${parseFloat(inventory.product?.unitPrice || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Description */}
              {inventory.product?.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {inventory.product.description}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Warehouse Info */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Warehouse Location
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                  }}
                >
                  <Warehouse color="primary" />
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {inventory.warehouse?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {inventory.warehouse?.location}
                    </Typography>
                    {inventory.warehouse?.address && (
                      <Typography variant="caption" color="text.secondary">
                        {inventory.warehouse.address}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Stock Level Progress */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Stock Level Status
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {inventory.quantity} / {reorderLevel * 2} units
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {stockPercentage.toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stockPercentage}
                  color={stockStatus.color}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {/* Current Stock */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: stockStatus.color + '.main', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <InventoryIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="caption">Current Stock</Typography>
                      <Typography variant="h3" fontWeight={700}>
                        {inventory.quantity}
                      </Typography>
                      <Typography variant="caption">units</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Reorder Level */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.light' }}>
                      <TrendingDown />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Reorder Level
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {reorderLevel}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Value */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.light' }}>
                      <AttachMoney />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Total Value
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        ${inventoryValue.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <History color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Recent Transactions
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {inventory.transactions && inventory.transactions.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inventory.transactions.slice(0, 10).map((transaction) => (
                        <TableRow key={transaction.id} hover>
                          <TableCell>
                            <Chip
                              label={transaction.type.replace('_', ' ')}
                              size="small"
                              color={
                                transaction.type === 'STOCK_IN'
                                  ? 'success'
                                  : transaction.type === 'STOCK_OUT'
                                  ? 'error'
                                  : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color={
                                transaction.quantity > 0 ? 'success.main' : 'error.main'
                              }
                            >
                              {transaction.quantity > 0 ? '+' : ''}
                              {transaction.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {transaction.user?.firstName} {transaction.user?.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(transaction.createdAt).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {transaction.notes || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <History sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No transaction history available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryDetails;
