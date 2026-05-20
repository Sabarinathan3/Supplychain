import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const StatCard = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  trendValue,
  subtitle,
  progress,
  loading = false,
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return <TrendingUp fontSize="small" />;
    if (trend === 'down') return <TrendingDown fontSize="small" />;
    return <Remove fontSize="small" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'success';
    if (trend === 'down') return 'error';
    return 'default';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: 6,
          },
          transition: 'all 0.3s',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {title}
              </Typography>
              {loading ? (
                <Box sx={{ width: 100, height: 32, bgcolor: 'grey.200', borderRadius: 1, mt: 1 }} />
              ) : (
                <Typography variant="h4" fontWeight={700}>
                  {value}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>

            <Avatar
              sx={{
                bgcolor: `${color}.light`,
                color: `${color}.main`,
                width: 56,
                height: 56,
              }}
            >
              {icon}
            </Avatar>
          </Box>

          {trendValue && (
            <Chip
              icon={getTrendIcon()}
              label={trendValue}
              color={getTrendColor()}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}

          {progress !== undefined && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                color={color}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}
        </CardContent>

        {/* Decorative Background */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            bgcolor: `${color}.main`,
            opacity: 0.05,
          }}
        />
      </Card>
    </motion.div>
  );
};

export default StatCard;
