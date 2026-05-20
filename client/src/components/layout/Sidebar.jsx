import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Warehouse as WarehouseIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ProductsIcon,
  LocalShipping as VendorsIcon,
  Receipt as OrdersIcon,
  LocalShipping as DeliveriesIcon,
  SwapHoriz as TransfersIcon,
  BarChart as AnalyticsIcon,
  Person as ProfileIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Warehouses', icon: <WarehouseIcon />, path: '/warehouses' },
  { text: 'Products', icon: <ProductsIcon />, path: '/products' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Vendors', icon: <VendorsIcon />, path: '/vendors' },
  { text: 'Orders', icon: <OrdersIcon />, path: '/orders' },
  { text: 'Deliveries', icon: <DeliveriesIcon />, path: '/deliveries' },
  { text: 'Transfers', icon: <TransfersIcon />, path: '/transfers' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
];

const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo & Brand */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <InventoryIcon sx={{ color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            SupplyChain
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Enterprise System
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* User Profile Card */}
      <Box
        sx={{
          p: 2,
          mx: 2,
          mt: 2,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/profile')}
          >
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'inline-block',
              }}
            >
              {user?.role}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, px: 2, mt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2026 SupplyChain Pro
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            boxShadow: '4px 0 12px rgba(0,0,0,0.05)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
