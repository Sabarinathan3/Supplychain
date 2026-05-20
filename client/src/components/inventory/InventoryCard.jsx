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
  Tooltip,
  Grid,
} from '@mui/material';
import {
  MoreVert,
  Warehouse,
  Inventory as InventoryIcon,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const InventoryCard = ({ inventory, onMenuClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/inventory/${inventory.id}`);
  };

  const getStockStatus = () => {
    const { quantity } = inventory;
    const reorderLevel = inventory.product?.reorderLevel || 0;

    if (quantity === 0) {
      return { label: 'Out of Stock', color: 'error', icon: <Warning /> };
    }
    if (quantity <= reorderLevel) {
      return { label: 'Low Stock', color: 'warning', icon: <TrendingDown /> };
    }
    if (quantity <= reorderLevel * 1.5) {
      return { label: 'Moderate', color: 'info', icon: <TrendingUp /> };
    }
    return { label: 'In Stock', color: 'success', icon: <CheckCircle /> };
  };

  const stockStatus = getStockStatus();
  const reorderLevel = inventory.product?.reorderLevel || 0;
  const stockPercentage = reorderLevel > 0 
    ? Math.min((inventory.quantity / (reorderLevel * 2)) * 100, 100)
    : 100;

  const inventoryValue = inventory.quantity * parseFloat(inventory.product?.unitPrice || 0);

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
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            boxShadow: 6,
          },
          transition: 'all 0.3s',
        }}
        onClick={handleCardClick}
      >
        {/* Alert Badge */}
        {inventory.quantity === 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              bgcolor: 'error.main',
              color: 'white',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              boxShadow: 2,
            }}
          >
            <Warning fontSize="small" />
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
                bgcolor: stockStatus.color + '.main',
                width: 48,
                height: 48,
              }}
            >
              <InventoryIcon />
            </Avatar>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick(e, inventory);
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>

          {/* Product Name */}
          <Typography
            variant="h6"
            fontWeight={700}
            gutterBottom
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {inventory.product?.name}
          </Typography>

          {/* SKU */}
          <Typography
            variant="caption"
            color="text.secondary"
            fontFamily="monospace"
            sx={{ display: 'block', mb: 1 }}
          >
            SKU: {inventory.product?.sku}
          </Typography>

          {/* Category */}
          <Chip
            label={inventory.product?.category}
            size="small"
            variant="outlined"
            sx={{ mb: 2 }}
          />

          {/* Warehouse Info */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
              p: 1.5,
              bgcolor: 'background.default',
              borderRadius: 1,
            }}
          >
            <Warehouse fontSize="small" color="action" />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Warehouse
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                noWrap
              >
                {inventory.warehouse?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {inventory.warehouse?.location}
              </Typography>
            </Box>
          </Box>

          {/* Stock Quantity */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Current Stock
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  color={stockStatus.color + '.main'}
                >
                  {inventory.quantity}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Reorder At
                </Typography>
                <Typography variant="h4" fontWeight={700} color="text.secondary">
                  {reorderLevel}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Stock Level Progress */}
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
                Stock Level
              </Typography>
              <Chip
                icon={stockStatus.icon}
                label={stockStatus.label}
                color={stockStatus.color}
                size="small"
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            </Box>
            <Tooltip title={`${stockPercentage.toFixed(0)}% of optimal level`}>
              <LinearProgress
                variant="determinate"
                value={stockPercentage}
                color={stockStatus.color}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: stockStatus.color + '.light',
                }}
              />
            </Tooltip>
          </Box>

          {/* Value & Price */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Unit Price
              </Typography>
              <Typography variant="body1" fontWeight={700} color="success.main">
                ${parseFloat(inventory.product?.unitPrice || 0).toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Total Value
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                ${inventoryValue.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Last Updated */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 2, textAlign: 'center' }}
          >
            Updated: {new Date(inventory.updatedAt).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InventoryCard;
