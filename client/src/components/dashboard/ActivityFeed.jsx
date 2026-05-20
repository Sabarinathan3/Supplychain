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
  Typography,
  IconButton,
} from '@mui/material';
import {
  MoreVert,
  ShoppingCart,
  Inventory,
  LocalShipping,
  PersonAdd,
  TrendingUp,
} from '@mui/icons-material';

const ActivityFeed = ({ activities = [], loading = false }) => {
  const getActivityIcon = (type) => {
    const icons = {
      ORDER_CREATED: <ShoppingCart />,
      STOCK_UPDATED: <Inventory />,
      SHIPMENT_CREATED: <LocalShipping />,
      USER_ADDED: <PersonAdd />,
      SALE_COMPLETED: <TrendingUp />,
    };
    return icons[type] || <TrendingUp />;
  };

  const getActivityColor = (type) => {
    const colors = {
      ORDER_CREATED: 'primary',
      STOCK_UPDATED: 'warning',
      SHIPMENT_CREATED: 'info',
      USER_ADDED: 'success',
      SALE_COMPLETED: 'secondary',
    };
    return colors[type] || 'default';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader title="Recent Activity" />
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Box key={i} sx={{ height: 60, bgcolor: 'grey.100', borderRadius: 1 }} />
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader title="Recent Activity" />
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No recent activity
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Recent Activity"
        action={
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        }
      />
      <CardContent sx={{ p: 0 }}>
        <List>
          {activities.slice(0, 10).map((activity, index) => (
            <ListItem key={activity.id} divider={index < activities.length - 1}>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: `${getActivityColor(activity.type)}.light`,
                    color: `${getActivityColor(activity.type)}.main`,
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={activity.description}
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {activity.user?.name || 'System'}
                    </Typography>
                    {' • '}
                    <Typography variant="caption" color="text.secondary">
                      {new Date(activity.createdAt).toLocaleString()}
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

export default ActivityFeed;
