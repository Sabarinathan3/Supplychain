import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Divider,
  LinearProgress,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  MoreVert,
  ShoppingCart,
  Person,
  Warehouse,
  LocalShipping,
  CheckCircle,
  Cancel,
  Schedule,
  AttachMoney,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const OrderCard = ({ order, onMenuClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/orders/${order.id}`);
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: { color: 'warning', icon: <Schedule />, label: 'Pending' },
      CONFIRMED: { color: 'info', icon: <CheckCircle />, label: 'Confirmed' },
      PROCESSING: { color: 'primary', icon: <ShoppingCart />, label: 'Processing' },
      SHIPPED: { color: 'secondary', icon: <LocalShipping />, label: 'Shipped' },
      DELIVERED: { color: 'success', icon: <CheckCircle />, label: 'Delivered' },
      CANCELLED: { color: 'error', icon: <Cancel />, label: 'Cancelled' },
    };
    return configs[status] || configs.PENDING;
  };

  const statusConfig = getStatusConfig(order.status);

  const getStatusProgress = (status) => {
    const progressMap = {
      PENDING: 20,
      CONFIRMED: 40,
      PROCESSING: 60,
      SHIPPED: 80,
      DELIVERED: 100,
      CANCELLED: 0,
    };
    return progressMap[status] || 0;
  };

  const totalAmount = order.totalAmount || 
    order.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        sx={{
          height: '100%',
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            boxShadow: 8,
          },
          transition: 'all 0.3s',
        }}
        onClick={handleCardClick}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: statusConfig.color + '.main',
                  width: 48,
                  height: 48,
                }}
              >
                {statusConfig.icon}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Order #{order.orderNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(order.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick(e, order);
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>

          {/* Status */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Chip
                icon={statusConfig.icon}
                label={statusConfig.label}
                color={statusConfig.color}
                size="small"
              />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {getStatusProgress(order.status)}%
              </Typography>
            </Box>
            {order.status !== 'CANCELLED' && (
              <LinearProgress
                variant="determinate"
                value={getStatusProgress(order.status)}
                color={statusConfig.color}
                sx={{ height: 6, borderRadius: 3 }}
              />
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Order Details */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {/* Customer */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person fontSize="small" color="action" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {order.customer?.name || order.vendor?.name || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Warehouse */}
            {order.warehouse && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warehouse fontSize="small" color="action" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      Warehouse
                    </Typography>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {order.warehouse.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Items Count */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'background.default',
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Order Items
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}
            </Typography>
          </Box>

          {/* Total Amount */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AttachMoney fontSize="small" color="success" />
              <Typography variant="caption" color="text.secondary">
                Total Amount
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight={700} color="success.main">
              ${parseFloat(totalAmount).toFixed(2)}
            </Typography>
          </Box>

          {/* Delivery Date */}
          {order.deliveryDate && (
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Expected Delivery:{' '}
                <strong>{new Date(order.deliveryDate).toLocaleDateString()}</strong>
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrderCard;
