import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Typography,
} from '@mui/material';
import {
  MoreVert,
  ShoppingCart,
  CheckCircle,
  Schedule,
  LocalShipping,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RecentOrders = ({ orders = [], loading = false }) => {
  const navigate = useNavigate();

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: { color: 'warning', icon: <Schedule fontSize="small" /> },
      CONFIRMED: { color: 'info', icon: <CheckCircle fontSize="small" /> },
      PROCESSING: { color: 'primary', icon: <ShoppingCart fontSize="small" /> },
      SHIPPED: { color: 'secondary', icon: <LocalShipping fontSize="small" /> },
      DELIVERED: { color: 'success', icon: <CheckCircle fontSize="small" /> },
    };
    return configs[status] || configs.PENDING;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader title="Recent Orders" />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Box key={i} sx={{ height: 40, bgcolor: 'grey.100', borderRadius: 1 }} />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader title="Recent Orders" />
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ShoppingCart sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No recent orders
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Recent Orders"
        action={
          <IconButton size="small" onClick={() => navigate('/orders')}>
            <MoreVert />
          </IconButton>
        }
      />
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.slice(0, 5).map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const totalAmount = order.totalAmount || 0;

                return (
                  <TableRow
                    key={order.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          <ShoppingCart fontSize="small" />
                        </Avatar>
                        <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                          #{order.orderNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{order.vendor?.name || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        ${parseFloat(totalAmount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusConfig.icon}
                        label={order.status}
                        color={statusConfig.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
