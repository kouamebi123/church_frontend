import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { usePermissions } from '@hooks/usePermissions';
import i18nService from '@services/i18nService';

const AccessControl = ({ 
  allowedRoles = [], 
  children, 
  fallback = null,
  showMessage = true 
}) => {
  const permissions = usePermissions();
  
  // Vérifier si l'utilisateur a un des rôles autorisés
  const hasAccess = allowedRoles.some(role => {
    switch (role) {
      case 'SUPER_ADMIN':
        return permissions.isSuperAdmin;
      case 'ADMIN':
        return permissions.isAdmin;
      case 'MANAGER':
        return permissions.isManager;
      case 'SUPERVISEUR':
        return permissions.isSuperviseur;
      case 'COLLECTEUR_CULTE':
        return permissions.isCollecteurCulte;
      case 'COLLECTEUR_RESEAUX':
        return permissions.isCollecteurReseaux;
      default:
        return false;
    }
  });

  if (hasAccess) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  if (!showMessage) {
    return null;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '50vh',
      p: 3
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 5, 
          textAlign: 'center', 
          maxWidth: 500,
          borderRadius: '30px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(239, 68, 68, 0.15)',
          boxShadow: '0 20px 60px rgba(239, 68, 68, 0.12)'
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {i18nService.t('errors.accessDenied')}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {i18nService.t('errors.insufficientPermissions')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {i18nService.t('errors.contactAdmin')}
        </Typography>
      </Paper>
    </Box>
  );
};

export default AccessControl;
