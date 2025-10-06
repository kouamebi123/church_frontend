import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Button,
  Container
} from '@mui/material';
import { Church, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ChurchAccessError = ({ error, onRetry }) => {
  const navigate = useNavigate();

  const getErrorContent = () => {
    switch (error?.code) {
      case 'NO_CHURCH_ASSIGNMENT':
        return {
          title: 'Accès refusé',
          message: 'Vous devez être assigné à une église pour accéder au système.',
          severity: 'error',
          icon: <Church color="error" sx={{ fontSize: 60 }} />,
          action: 'Veuillez contacter un administrateur pour vous assigner à une église.'
        };
      
      case 'CHURCH_NOT_FOUND':
        return {
          title: 'Église introuvable',
          message: 'Votre église assignée n\'existe plus.',
          severity: 'error',
          icon: <Warning color="error" sx={{ fontSize: 60 }} />,
          action: 'Veuillez contacter un administrateur pour résoudre ce problème.'
        };

      default:
        return {
          title: 'Erreur d\'accès',
          message: error?.message || 'Une erreur est survenue lors de la vérification de votre accès.',
          severity: 'error',
          icon: <Warning color="error" sx={{ fontSize: 60 }} />,
          action: 'Veuillez contacter un administrateur.'
        };
    }
  };

  const errorContent = getErrorContent();

  const handleLogout = () => {
    // Supprimer le token et rediriger vers la page de connexion
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            width: '100%',
            maxWidth: 500
          }}
        >
          <Box sx={{ mb: 3 }}>
            {errorContent.icon}
          </Box>
          
          <Typography variant="h4" component="h1" gutterBottom color="error">
            {errorContent.title}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {errorContent.message}
          </Typography>
          
          <Alert severity={errorContent.severity} sx={{ mb: 3, textAlign: 'left' }}>
            <strong>Action requise :</strong> {errorContent.action}
          </Alert>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {onRetry && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleRetry}
                size="large"
              >
                Réessayer
              </Button>
            )}
            
            <Button
              variant="outlined"
              color="primary"
              onClick={handleLogout}
              size="large"
            >
              Se déconnecter
            </Button>
          </Box>
          
          {error?.requiresAction && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Code d'erreur :</strong> {error.code}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Ce code peut être utile pour l'administrateur lors de la résolution du problème.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ChurchAccessError;
