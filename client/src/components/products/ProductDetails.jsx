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
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  Category,
  AttachMoney,
  Inventory,
  QrCode2,
  Warehouse,
  TrendingUp,
  TrendingDown,
  Warning,
} from '@mui/icons-material';

const ProductDetails = ({ product }) => {
  const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
  const isLowStock = totalStock <= product.reorderLevel;
  const isOutOfStock = totalStock === 0;

  const getStockStatus = () => {
    if (isOutOfStock) return { label: 'Out of Stock', color: 'error', icon: <Warning /> };
    if (isLowStock) return { label: 'Low Stock', color: 'warning', icon: <TrendingDown /> };
    return { label: 'In Stock', color: 'success', icon: <TrendingUp /> };
  };

  const stockStatus = getStockStatus();

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Main Info Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                {/* Product Image */}
                {product.imageUrl ? (
                  <Avatar
                    src={product.imageUrl}
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: 2,
                    }}
                    variant="rounded"
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                    }}
                    variant="rounded"
                  >
                    {product.name?.[0]}
                  </Avatar>
                )}

                {/* Product Info */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {product.name}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      icon={<Category fontSize="small" />}
                      label={product.category}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={stockStatus.icon}
                      label={stockStatus.label}
                      color={stockStatus.color}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <QrCode2 fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                      SKU: <strong>{product.sku}</strong>
                    </Typography>
                  </Box>

                  {product.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {product.description}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Pricing & Stock Info */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'success.light',
                      borderRadius: 2,
                      textAlign: 'center',
                    }}
                  >
                    <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Unit Price
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      ${parseFloat(product.unitPrice).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: isOutOfStock ? 'error.light' : isLowStock ? 'warning.light' : 'primary.light',
                      borderRadius: 2,
                      textAlign: 'center',
                    }}
                  >
                    <Inventory
                      sx={{
                        fontSize: 40,
                        color: isOutOfStock ? 'error.main' : isLowStock ? 'warning.main' : 'primary.main',
                        mb: 1,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Total Stock
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color={isOutOfStock ? 'error.main' : isLowStock ? 'warning.main' : 'primary.main'}
                    >
                      {totalStock}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'info.light',
                      borderRadius: 2,
                      textAlign: 'center',
                    }}
                  >
                    <TrendingDown sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Reorder Level
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {product.reorderLevel}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Stock Value Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Stock Value
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  ${(totalStock * parseFloat(product.unitPrice)).toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Inventory Value
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Stats
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Warehouses
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {product.inventory?.length || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Warehouse Inventory Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Inventory by Warehouse
              </Typography>
              <Divider sx={{ my: 2 }} />

              {product.inventory && product.inventory.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Warehouse</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Last Updated</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {product.inventory.map((inv) => {
                        const isWarehouseLowStock = inv.quantity <= product.reorderLevel;
                        const value = inv.quantity * parseFloat(product.unitPrice);

                        return (
                          <TableRow key={inv.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Warehouse fontSize="small" color="action" />
                                <Typography variant="body2" fontWeight={600}>
                                  {inv.warehouse?.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {inv.warehouse?.location}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={inv.quantity === 0 ? 'error.main' : 'text.primary'}
                              >
                                {inv.quantity}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                ${value.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  inv.quantity === 0
                                    ? 'Out of Stock'
                                    : isWarehouseLowStock
                                    ? 'Low Stock'
                                    : 'In Stock'
                                }
                                color={
                                  inv.quantity === 0
                                    ? 'error'
                                    : isWarehouseLowStock
                                    ? 'warning'
                                    : 'success'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(inv.updatedAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Inventory sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No inventory records found
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

export default ProductDetails;
