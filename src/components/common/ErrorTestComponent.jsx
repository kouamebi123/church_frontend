import React, { useState } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { handleApiError, ERROR_TYPES } from '@utils/errorHandler';
import i18nService from '@services/i18nService';
import SecureErrorMessage from './SecureErrorMessage';

/**
 * Composant de test pour vérifier la gestion d'erreur
 * À supprimer en production
 */
const ErrorTestComponent = () => {
  const [testError, setTestError] = useState(null);
  const [processedError, setProcessedError] = useState(null);

  // Simuler différents types d'erreurs
  const testErrors = [
    {
      name: i18nService.t('errors.validation400'),
      error: {
        response: {
          status: 400,
          data: { message: 'Données invalides' }
        }
      }
    },
    {
      name: i18nService.t('errors.auth401'),
      error: {
        response: {
          status: 401,
          data: { message: 'Token expiré' }
        }
      }
    },
    {
      name: i18nService.t('errors.permission403'),
      error: {
        response: {
          status: 403,
          data: { message: 'Accès refusé' }
        }
      }
    },
    {
      name: i18nService.t('errors.notFound404'),
      error: {
        response: {
          status: 404,
          data: { message: 'Utilisateur non trouvé' }
        }
      }
    },
    {
      name: i18nService.t('errors.conflict409'),
      error: {
        response: {
          status: 409,
          data: { message: 'Email déjà utilisé' }
        }
      }
    },
    {
      name: i18nService.t('errors.server500'),
      error: {
        response: {
          status: 500,
          data: { message: 'Erreur interne du serveur' }
        }
      }
    },
    {
      name: i18nService.t('errors.network'),
      error: {
        code: 'ECONNREFUSED',
        message: 'Impossible de se connecter au serveur'
      }
    },
    {
      name: i18nService.t('errors.timeout'),
      error: {
        code: 'ECONNABORTED',
        message: 'La requête a pris trop de temps'
      }
    }
  ];

  const handleTestError = (errorData) => {
    setTestError(errorData.error);
    const processed = handleApiError(errorData.error, 'test');
    setProcessedError(processed);
  };

  const clearErrors = () => {
    setTestError(null);
    setProcessedError(null);
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        🧪 Test de la Gestion d'Erreur
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ce composant teste différents types d'erreurs pour vérifier que la gestion est sécurisée.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Erreurs de test :
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {testErrors.map((test, index) => (
            <Button
              key={index}
              variant="outlined"
              size="small"
              onClick={() => handleTestError(test)}
              sx={{ mb: 1 }}
            >
              {test.name}
            </Button>
          ))}
        </Box>
      </Box>

      {testError && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Erreur brute (pour les développeurs) :
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.100' }}>
            <pre style={{ fontSize: '12px', margin: 0 }}>
              {JSON.stringify(testError, null, 2)}
            </pre>
          </Paper>
        </Box>
      )}

      {processedError && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Erreur traitée :
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'blue.50' }}>
            <Typography variant="body2">
              <strong>Type:</strong> {processedError.type}
            </Typography>
            <Typography variant="body2">
              <strong>Message:</strong> {processedError.message}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {processedError.status || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>Réseau:</strong> {processedError.isNetworkError ? i18nService.t('common.actions.yes') : i18nService.t('common.actions.no')}
            </Typography>
            <Typography variant="body2">
              <strong>Auth:</strong> {processedError.isAuthError ? i18nService.t('common.actions.yes') : i18nService.t('common.actions.no')}
            </Typography>
            <Typography variant="body2">
              <strong>Serveur:</strong> {processedError.isServerError ? i18nService.t('common.actions.yes') : i18nService.t('common.actions.no')}
            </Typography>
          </Paper>
        </Box>
      )}

      {testError && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Affichage sécurisé (ce que voit l'utilisateur) :
          </Typography>
          <SecureErrorMessage 
            error={processedError} 
            title={i18nService.t('common.actions.testError')}
            showTitle={true}
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={clearErrors}
        >
          Effacer les erreurs
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => {
            }}
        >
          Vérifier les imports
        </Button>
      </Box>

      <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.7 }}>
        💡 Ce composant doit être supprimé en production. Il sert uniquement au développement et aux tests.
      </Typography>
    </Paper>
  );
};

export default ErrorTestComponent;
