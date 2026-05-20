import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Button } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  actionLabel,
  onAction,
  actionIcon,
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 4 }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              underline="hover"
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              href={crumb.path}
              onClick={(e) => {
                e.preventDefault();
                if (crumb.path) navigate(crumb.path);
              }}
              sx={{
                cursor: crumb.path ? 'pointer' : 'default',
                fontWeight: index === breadcrumbs.length - 1 ? 600 : 400,
              }}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}

      {/* Title and Action */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {action && (
          <Button
            variant="contained"
            onClick={onAction}
            startIcon={actionIcon}
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
