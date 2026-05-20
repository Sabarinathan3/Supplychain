import React from 'react';
import { Chip } from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Warning,
  Info,
} from '@mui/icons-material';

const StatusChip = ({ status, label, size = 'small' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      success: { color: 'success', icon: <CheckCircle fontSize="small" /> },
      error: { color: 'error', icon: <Cancel fontSize="small" /> },
      warning: { color: 'warning', icon: <Warning fontSize="small" /> },
      info: { color: 'info', icon: <Info fontSize="small" /> },
      pending: { color: 'default', icon: <Schedule fontSize="small" /> },
    };
    return configs[status.toLowerCase()] || configs.info;
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      icon={config.icon}
      label={label || status}
      color={config.color}
      size={size}
    />
  );
};

export default StatusChip;
