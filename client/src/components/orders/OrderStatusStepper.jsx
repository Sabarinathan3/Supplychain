import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Paper,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  ShoppingCart,
  LocalShipping,
  Cancel,
} from '@mui/icons-material';

const OrderStatusStepper = ({ order, orientation = 'horizontal' }) => {
  const steps = [
    {
      label: 'Order Placed',
      description: 'Order has been created',
      status: 'PENDING',
      icon: <Schedule />,
      date: order.createdAt,
    },
    {
      label: 'Confirmed',
      description: 'Order has been confirmed',
      status: 'CONFIRMED',
      icon: <CheckCircle />,
      date: order.confirmedAt,
    },
    {
      label: 'Processing',
      description: 'Order is being prepared',
      status: 'PROCESSING',
      icon: <ShoppingCart />,
      date: order.processingAt,
    },
    {
      label: 'Shipped',
      description: 'Order has been shipped',
      status: 'SHIPPED',
      icon: <LocalShipping />,
      date: order.shippedAt,
    },
    {
      label: 'Delivered',
      description: 'Order has been delivered',
      status: 'DELIVERED',
      icon: <CheckCircle />,
      date: order.deliveredAt,
    },
  ];

  const getActiveStep = () => {
    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    return order.status === 'CANCELLED' ? -1 : statusOrder.indexOf(order.status);
  };

  const activeStep = getActiveStep();

  if (order.status === 'CANCELLED') {
    return (
      <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Cancel fontSize="large" />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Order Cancelled
            </Typography>
            <Typography variant="body2">
              This order was cancelled on{' '}
              {order.cancelledAt
                ? new Date(order.cancelledAt).toLocaleString()
                : 'N/A'}
            </Typography>
            {order.cancellationReason && (
              <Typography variant="caption">
                Reason: {order.cancellationReason}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Stepper activeStep={activeStep} orientation={orientation}>
      {steps.map((step, index) => (
        <Step key={step.label} completed={index < activeStep}>
          <StepLabel
            icon={step.icon}
            optional={
              step.date && index <= activeStep ? (
                <Typography variant="caption">
                  {new Date(step.date).toLocaleString()}
                </Typography>
              ) : null
            }
          >
            {step.label}
          </StepLabel>
          {orientation === 'vertical' && (
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </StepContent>
          )}
        </Step>
      ))}
    </Stepper>
  );
};

export default OrderStatusStepper;
