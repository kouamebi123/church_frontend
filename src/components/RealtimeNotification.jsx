import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  Avatar,
  Chip,
  Slide,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  PriorityHigh as PriorityHighIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { useRealtimeMessaging } from '@hooks/useRealtimeMessaging';
import i18nService from '@services/i18nService';

const SlideTransition = (props) => {
  return <Slide {...props} direction="left" />;
};

const RealtimeNotification = () => {
  const { notifications, removeNotification } = useRealtimeMessaging();
  const [currentNotification, setCurrentNotification] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      setCurrentNotification(latestNotification);
      setOpen(true);
    }
  }, [notifications]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    if (currentNotification) {
      removeNotification(currentNotification.id);
    }
    setOpen(false);
    setCurrentNotification(null);
  };

  const handleExited = () => {
    setCurrentNotification(null);
  };

  if (!currentNotification) {
    return null;
  }

  const isUrgent = currentNotification.is_urgent;
  const senderName = currentNotification.sender?.pseudo || i18nService.t('messages.defaultUser');

  return (
    <Snackbar
      open={open}
      autoHideDuration={isUrgent ? 8000 : 5000}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          minWidth: '320px',
          maxWidth: '400px'
        }
      }}
    >
      <Alert
        onClose={handleClose}
        severity={isUrgent ? 'warning' : 'info'}
        variant="filled"
        sx={{
          width: '100%',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%' }}>
          {/* Avatar de l'expéditeur */}
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: isUrgent ? '#ff9800' : '#1976d2',
              fontSize: '0.875rem'
            }}
          >
            {senderName.charAt(0).toUpperCase()}
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0}}>
            {/* En-tête avec nom et indicateur urgent */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600,
                color: 'inherit',
                fontSize: '0.875rem'
              }}>
                {senderName}
              </Typography>
              {isUrgent && (
                <Chip
                  icon={<PriorityHighIcon sx={{ fontSize: '0.75rem !important' }} />}
                  label={i18nService.t('messages.urgent')}
                  size="small"
                  sx={{
                    height: '20px',
                    fontSize: '0.7rem',
                    '& .MuiChip-icon': {
                      fontSize: '0.75rem'
                    }
                  }}
                />
              )}
            </Box>
            
            {/* Contenu du message */}
            <Typography variant="body2" sx={{
              color: 'inherit',
              fontSize: '0.8rem',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentNotification.content}
            </Typography>
            
            {/* Timestamp */}
            <Typography variant="caption" sx={{
              color: 'inherit',
              opacity: 0.8,
              fontSize: '0.7rem',
              display: 'block',
              mt: 0.5
            }}>
              {new Date(currentNotification.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default RealtimeNotification;
