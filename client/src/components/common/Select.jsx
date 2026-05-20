import React from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  InputAdornment,
} from '@mui/material';

const Select = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  fullWidth = true,
  startIcon,
  variant = 'outlined',
  size = 'medium',
  ...props
}) => {
  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      disabled={disabled}
      required={required}
      variant={variant}
      size={size}
    >
      <InputLabel>{label}</InputLabel>
      <MuiSelect
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        label={label}
        startAdornment={
          startIcon && <InputAdornment position="start">{startIcon}</InputAdornment>
        }
        {...props}
      >
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default Select;
