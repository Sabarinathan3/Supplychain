import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

const SearchBar = ({
  placeholder = 'Search...',
  value,
  onChange,
  onClear,
  fullWidth = true,
}) => {
  const [localValue, setLocalValue] = useState(value || '');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
    onClear?.();
  };

  return (
    <TextField
      fullWidth={fullWidth}
      size="small"
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
        endAdornment: localValue && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear}>
              <Clear />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;
