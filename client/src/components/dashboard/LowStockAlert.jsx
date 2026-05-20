import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Typography,
  Badge,
} from '@mui/material';
import {
  Warning,
  MoreVert,
  Inventory,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LowStockAlert = ({ items = [], loading = false }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader
          avatar={
            <Badge badgeContent={0} color="error">
              <Warning color="warning" />
            </Badge>
          }
          title="Low Stock Alerts"
        />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ height: 60, bgcolor: 'grey.100', borderRadius: 1 }} />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader
          avatar={
            <Badge badgeContent={0} color="success">
              <Warning color="action" />
            </Badge>
          }
          title="Low Stock Alerts"
        />
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Inventory sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              All items are well stocked
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        avatar={
          <Badge badgeContent={items.length} color="error">
            <Warning color="warning" />
          </Badge>
        }
        title="Low Stock Alerts"
        action={
          <IconButton size="small" onClick={() => navigate('/inventory')}>
            <MoreVert />
          </IconButton>
        }
      />
      <CardContent sx={{ p: 0 }}>
        <List>
          {items.slice(0, 5).map((item, index) => (
            <ListItem
              key={item.id}
              divider={index < items.length - 1}
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => navigate(`/inventory/${item.id}`)}
              secondaryAction={
                <Chip
                  label={`${item.quantity} left`}
                  color="error"
                  size="small"
                  variant="outlined"
                />
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  {item.product?.name?.[0] || 'P'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={item.product?.name}
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      SKU: {item.product?.sku}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Reorder at: {item.product?.reorderLevel}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
