import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  Avatar,
  Divider,
  ListItemIcon,
  Switch,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { logout } from '../../redux/slices/authSlice';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { markAllAsRead } from '../../redux/slices/notificationSlice';

const Navbar = ({ handleDrawerToggle }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const mode = useSelector((state) => state.theme?.mode ?? 'light');
  const { notifications, unreadCount } = useSelector(
    (state) => state.notification || { notifications: [], unreadCount: 0 }
  );

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifMenu = (event) => {
    setAnchorElNotif(event.currentTarget);
  };

  const handleCloseNotifMenu = () => {
    setAnchorElNotif(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        {/* Mobile Menu Button */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page Title */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            color: 'text.primary',
            fontWeight: 600,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {getPageTitle(window.location.pathname)}
        </Typography>

        {/* Right Side Icons */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={handleThemeToggle} color="inherit">
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleOpenNotifMenu}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="Account">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
              <Avatar
                sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
              >
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Notifications Menu */}
        <Menu
          anchorEl={anchorElNotif}
          open={Boolean(anchorElNotif)}
          onClose={handleCloseNotifMenu}
          PaperProps={{
            sx: {
              mt: 1.5,
              width: 360,
              maxHeight: 400,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                sx={{ cursor: 'pointer', color: 'primary.main' }}
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </Typography>
            )}
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.slice(0, 5).map((notif) => (
              <MenuItem
                key={notif.id}
                sx={{
                  py: 1.5,
                  bgcolor: notif.read ? 'transparent' : 'action.hover',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {notif.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(notif.timestamp)}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Menu>

        {/* User Menu */}
        <Menu
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
          PaperProps={{
            sx: { mt: 1.5, minWidth: 220 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              navigate('/profile');
              handleCloseUserMenu();
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleCloseUserMenu}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

// Helper function to get page title
const getPageTitle = (pathname) => {
  const titles = {
    '/': 'Dashboard',
    '/warehouses': 'Warehouses',
    '/products': 'Products',
    '/inventory': 'Inventory',
    '/vendors': 'Vendors',
    '/orders': 'Orders',
    '/deliveries': 'Deliveries',
    '/transfers': 'Transfers',
    '/analytics': 'Analytics',
    '/profile': 'Profile',
  };
  return titles[pathname] || 'Dashboard';
};

// Helper function to format time
const formatTime = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now - time) / 1000); // seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default Navbar;
