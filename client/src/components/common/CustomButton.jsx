import React from 'react';
import { Button, CircularProgress } from '@mui/material';

const CustomButton = ({
  children,
  onClick,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  type = 'button',
  sx,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? null : startIcon}
      endIcon={loading ? null : endIcon}
      type={type}
      sx={sx}
      {...props}
    >
      {loading ? (
        <>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default CustomButton;
