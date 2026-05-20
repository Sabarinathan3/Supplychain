import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import OrderCard from './OrderCard';

const OrderList = ({ orders, onMenuClick, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <Box
              sx={{
                height: 350,
                bgcolor: 'grey.100',
                borderRadius: 2,
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
        }}
      >
        <ShoppingCart sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No orders found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search or filters
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {orders.map((order) => (
        <Grid item xs={12} sm={6} md={4} key={order.id}>
          <OrderCard order={order} onMenuClick={onMenuClick} />
        </Grid>
      ))}
    </Grid>
  );
};

export default OrderList;
