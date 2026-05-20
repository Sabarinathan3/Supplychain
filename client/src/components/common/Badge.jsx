import React from 'react';
import { Badge as MuiBadge } from '@mui/material';

const Badge = ({
  children,
  badgeContent,
  color = 'primary',
  variant = 'standard',
  max = 99,
  showZero = false,
  invisible = false,
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
  ...props
}) => {
  return (
    <MuiBadge
      badgeContent={badgeContent}
      color={color}
      variant={variant}
      max={max}
      showZero={showZero}
      invisible={invisible}
      anchorOrigin={anchorOrigin}
      {...props}
    >
      {children}
    </MuiBadge>
  );
};

export default Badge;
