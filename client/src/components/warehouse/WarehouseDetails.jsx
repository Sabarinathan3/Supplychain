import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from '@mui/material';
import {
  Warehouse,
  LocationOn,
  Inventory,
  Person,
  Phone,
  Email,
  TrendingUp,
  Warning,
  CheckCircle,
} from '@mui/icons-material';

const WarehouseDetails = ({ warehouse }) => {
  const calculateUtilization = () => {
    if (!warehouse.capacity || warehouse.capacity === 0) return 0;
    const currentStock = warehouse._count?.inventory || 0;
    return ((currentStock / warehouse.capacity) * 100).toFixed(1);
  };

  const utilization = calculateUtilization();
  const isHighUtilization = utilization > 80;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Main Info Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 64,
                    height: 64,
                  }}
                >
                  <Warehouse fontSize="large" />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {warehouse.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {warehouse.location}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={warehouse.isActive ? 'Active' : 'Inactive'}
                  color={warehouse.isActive ? 'success' : 'default'}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Address */}
              {warehouse.address && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Address
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {warehouse.address}
                  </Typography>
                </Box>
              )}

              {/* Capacity */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Storage Capacity
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {warehouse._count?.inventory || 0} / {warehouse.capacity} items
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={isHighUtilization ? 'error.main' : 'text.primary'}
                  >
                    {utilization}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(utilization)}
                  color={isHighUtilization ? 'error' : 'primary'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Contact Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List>
                {warehouse.contactPerson && (
                  <ListItem disablePadding sx={{ mb: 2 }}>
                    <ListItemIcon>
                      <Person color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Contact Person"
                      secondary={warehouse.contactPerson}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                )}

                {warehouse.contactPhone && (
                  <ListItem disablePadding sx={{ mb: 2 }}>
                    <ListItemIcon>
                      <Phone color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={warehouse.contactPhone}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                )}

                {warehouse.contactEmail && (
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <Email color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={warehouse.contactEmail}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <Inventory />
                </Avatar>
                <Box>
                  <Typography variant="caption">Total Items</Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {warehouse._count?.inventory || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="caption">Max Capacity</Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {warehouse.capacity}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: isHighUtilization ? 'warning.main' : 'info.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  {isHighUtilization ? <Warning /> : <CheckCircle />}
                </Avatar>
                <Box>
                  <Typography variant="caption">Utilization</Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {utilization}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WarehouseDetails;
