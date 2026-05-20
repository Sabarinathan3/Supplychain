import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

const Input = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  multiline = false,
  rows = 1,
  fullWidth = true,
  startIcon,
  endIcon,
  variant = 'outlined',
  size = 'medium',
  ...props
}) => {
  return (
    <TextField
      fullWidth={fullWidth}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      variant={variant}
      size={size}
      InputProps={{
        startAdornment: startIcon && (
          <InputAdornment position="start">{startIcon}</InputAdornment>
        ),
        endAdornment: endIcon && (
          <InputAdornment position="end">{endIcon}</InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

export default Input;
