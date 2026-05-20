import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';

const InfoCard = ({
  title,
  subtitle,
  avatar,
  icon,
  children,
  actions,
  onMenuClick,
  elevation = 1,
  sx,
}) => {
  return (
    <Card elevation={elevation} sx={sx}>
      {(title || subtitle || avatar || icon) && (
        <CardHeader
          avatar={
            avatar ? (
              <Avatar src={avatar} />
            ) : icon ? (
              <Avatar sx={{ bgcolor: 'primary.main' }}>{icon}</Avatar>
            ) : null
          }
          action={
            onMenuClick && (
              <IconButton onClick={onMenuClick}>
                <MoreVert />
              </IconButton>
            )
          }
          title={title}
          subheader={subtitle}
        />
      )}

      {children && (
        <>
          {(title || subtitle) && <Divider />}
          <CardContent>{children}</CardContent>
        </>
      )}

      {actions && (
        <>
          <Divider />
          <CardActions sx={{ px: 2, py: 1.5 }}>{actions}</CardActions>
        </>
      )}
    </Card>
  );
};

export default InfoCard;
