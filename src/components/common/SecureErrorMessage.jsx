import React from 'react';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import i18nService from '@services/i18nService';

/**
 * Composant d'affichage d'erreur sécurisé
 * Assure qu'aucune information technique n'est exposée à l'utilisateur
 */
const SecureErrorMessage = ({ 
  error, 
  title = i18nService.t('common.actions.error'), 
  variant = 'error',
  showTitle = true,
  showIcon = true,
  sx = {},
  onClose,
  action
}) => {
  // Si pas d'erreur, ne rien afficher
  if (!error) return null;

  // Déterminer le type d'erreur et le message approprié
  const getErrorDisplay = () => {
    // Si c'est un objet d'erreur traité par notre gestionnaire
    if (error.type && error.message) {
      return {
        type: error.type,
        message: error.message,
        severity: getSeverity(error.type)
      };
    }

    // Si c'est une erreur API avec message utilisateur
    if (error.userMessage) {
      return {
        type: 'UNKNOWN',
        message: error.userMessage,
        severity: 'error'
      };
    }

    // Si c'est une erreur avec message simple
    if (error.message && typeof error.message === 'string') {
      return {
        type: 'UNKNOWN',
        message: error.message,
        severity: 'error'
      };
    }

    // Erreur par défaut sécurisée
    return {
      type: 'UNKNOWN',
      message: i18nService.t('common.unexpectedError'),
      severity: 'error'
    };
  };

  const getSeverity = (errorType) => {
    switch (errorType) {
      case 'VALIDATION':
        return 'warning';
      case 'AUTHENTICATION':
      case 'AUTHORIZATION':
        return 'info';
      case 'NETWORK':
        return 'warning';
      case 'SERVER':
        return 'error';
      default:
        return 'error';
    }
  };

  const errorDisplay = getErrorDisplay();

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Alert
        severity={errorDisplay.severity}
        variant={variant}
        onClose={onClose}
        action={action}
        sx={{
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        {showTitle && (
          <AlertTitle sx={{ fontWeight: 'bold' }}>
            {title}
          </AlertTitle>
        )}
        
        <Typography variant="body2" component="div">
          {errorDisplay.message}
        </Typography>

        {/* Informations de débogage pour les développeurs uniquement */}
        {error.status && (
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mt: 1, 
              opacity: 0.7,
              fontFamily: 'monospace'
            }}
          >
            Code: {error.status} | Type: {errorDisplay.type}
          </Typography>
        )}
      </Alert>
    </Box>
  );
};

export default SecureErrorMessage;
