import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { usePermissions } from '../hooks/usePermissions';
import i18nService from '../services/i18nService';

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
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
        <Typography variant="h5" color="error" gutterBottom>
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
