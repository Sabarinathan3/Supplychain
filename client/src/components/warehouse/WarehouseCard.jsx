import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  LinearProgress,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Warehouse as WarehouseIcon,
  LocationOn,
  MoreVert,
  Inventory,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const WarehouseCard = ({ warehouse, onMenuClick }) => {
  const navigate = useNavigate();

  const calculateUtilization = () => {
    if (!warehouse.capacity || warehouse.capacity === 0) return 0;
    const currentStock = warehouse._count?.inventory || 0;
    return ((currentStock / warehouse.capacity) * 100).toFixed(1);
  };

  const utilization = calculateUtilization();
  const isHighUtilization = utilization > 80;
  const isNearCapacity = utilization > 90;

  const handleCardClick = () => {
    navigate(`/warehouses/${warehouse.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 6,
          },
          transition: 'all 0.3s',
        }}
        onClick={handleCardClick}
      >
        {/* Ribbon for high utilization */}
        {isNearCapacity && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: -35,
              transform: 'rotate(45deg)',
              backgroundColor: 'error.main',
              color: 'white',
              padding: '4px 40px',
              fontSize: '0.7rem',
              fontWeight: 600,
              zIndex: 1,
            }}
          >
            Near Full
          </Box>
        )}

        <CardContent>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 2,
            }}
          >
            <Avatar
              sx={{
                bgcolor: warehouse.isActive ? 'primary.main' : 'grey.400',
                width: 56,
                height: 56,
              }}
            >
              <WarehouseIcon fontSize="large" />
            </Avatar>
            <Box>
              {warehouse.isActive ? (
                <Chip label="Active" color="success" size="small" sx={{ mb: 1 }} />
              ) : (
                <Chip label="Inactive" color="default" size="small" sx={{ mb: 1 }} />
              )}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuClick(e, warehouse);
                }}
              >
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          {/* Warehouse Name */}
          <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
            {warehouse.name}
          </Typography>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" noWrap>
              {warehouse.location}
            </Typography>
          </Box>

          {/* Address */}
          {warehouse.address && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {warehouse.address}
            </Typography>
          )}

          {/* Capacity Progress */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Capacity Utilization
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isHighUtilization && (
                  <Tooltip title="High utilization">
                    <Warning fontSize="small" color="warning" />
                  </Tooltip>
                )}
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color={isHighUtilization ? 'error.main' : 'text.primary'}
                >
                  {utilization}%
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={parseFloat(utilization)}
              color={isNearCapacity ? 'error' : isHighUtilization ? 'warning' : 'primary'}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {warehouse._count?.inventory || 0} items
              </Typography>
              <Typography variant="caption" color="text.secondary">
                of {warehouse.capacity}
              </Typography>
            </Box>
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <Inventory fontSize="small" color="primary" />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Total Items
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {warehouse._count?.inventory || 0}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                  <TrendingUp fontSize="small" color="success" />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Capacity
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  {warehouse.capacity}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Contact Info */}
          {warehouse.contactPerson && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Contact: {warehouse.contactPerson}
              </Typography>
              {warehouse.contactPhone && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {warehouse.contactPhone}
                </Typography>
              )}
              {warehouse.contactEmail && (
                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                  {warehouse.contactEmail}
                </Typography>
              )}
            </Box>
          )}

          {/* Last Updated */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 2, textAlign: 'right' }}
          >
            Updated: {new Date(warehouse.updatedAt).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WarehouseCard;
