import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Tooltip,
  CardMedia,
  Badge,
} from '@mui/material';
import {
  MoreVert,
  Category,
  AttachMoney,
  Inventory,
  QrCode2,
  TrendingUp,
  TrendingDown,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product, onMenuClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const totalStock = product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
  const isLowStock = totalStock <= (product.reorderLevel || 0);
  const isOutOfStock = totalStock === 0;

  const getStockStatus = () => {
    if (isOutOfStock) return { label: 'Out of Stock', color: 'error', icon: <Warning /> };
    if (isLowStock) return { label: 'Low Stock', color: 'warning', icon: <TrendingDown /> };
    return { label: 'In Stock', color: 'success', icon: <TrendingUp /> };
  };

  const stockStatus = getStockStatus();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            boxShadow: 8,
          },
          transition: 'all 0.3s',
        }}
        onClick={handleCardClick}
      >
        {/* Stock Status Badge */}
        {isLowStock && (
          <Chip
            icon={stockStatus.icon}
            label={stockStatus.label}
            color={stockStatus.color}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 1,
              fontWeight: 600,
            }}
          />
        )}

        {/* Product Image */}
        {product.imageUrl ? (
          <CardMedia
            component="img"
            height="180"
            image={product.imageUrl}
            alt={product.name}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 180,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '2rem',
              }}
            >
              {product.name?.[0]}
            </Avatar>
          </Box>
        )}

        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {product.name}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick(e, product);
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>

          {/* SKU */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
            }}
          >
            <QrCode2 fontSize="small" color="action" />
            <Typography
              variant="caption"
              color="text.secondary"
              fontFamily="monospace"
              fontWeight={600}
            >
              {product.sku}
            </Typography>
          </Box>

          {/* Category */}
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<Category fontSize="small" />}
              label={product.category}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />
          </Box>

          {/* Description */}
          {product.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {product.description}
            </Typography>
          )}

          <Box sx={{ flex: 1 }} />

          {/* Price and Stock */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <AttachMoney fontSize="small" color="success" />
                <Typography variant="caption" color="text.secondary">
                  Unit Price
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color="success.main">
                ${parseFloat(product.unitPrice).toFixed(2)}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Inventory fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Total Stock
                </Typography>
              </Box>
              <Tooltip title={`Reorder at ${product.reorderLevel}`}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color={isOutOfStock ? 'error.main' : isLowStock ? 'warning.main' : 'text.primary'}
                >
                  {totalStock}
                </Typography>
              </Tooltip>
            </Box>
          </Box>

          {/* Reorder Level */}
          <Box
            sx={{
              mt: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Reorder Level: {product.reorderLevel}
            </Typography>
            {!isOutOfStock && (
              <Chip
                icon={stockStatus.icon}
                label={stockStatus.label}
                color={stockStatus.color}
                size="small"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            )}
          </Box>

          {/* Inventory Locations Count */}
          {product.inventory && product.inventory.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Available in {product.inventory.length} warehouse
              {product.inventory.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
