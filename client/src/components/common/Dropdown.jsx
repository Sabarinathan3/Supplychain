import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';

const Dropdown = ({
  items = [],
  icon = <MoreVert />,
  onItemClick,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleItemClick = (event, item) => {
    event.stopPropagation();
    onItemClick?.(item);
    handleClose(event);
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        {icon}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.divider ? (
              <Divider />
            ) : (
              <MenuItem
                onClick={(e) => handleItemClick(e, item)}
                disabled={item.disabled}
                sx={item.danger ? { color: 'error.main' } : {}}
              >
                {item.icon && (
                  <ListItemIcon sx={item.danger ? { color: 'error.main' } : {}}>
                    {item.icon}
                  </ListItemIcon>
                )}
                <ListItemText>{item.label}</ListItemText>
              </MenuItem>
            )}
          </React.Fragment>
        ))}
      </Menu>
    </>
  );
};

export default Dropdown;
