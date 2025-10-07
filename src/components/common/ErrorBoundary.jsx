import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import i18nService from '@services/i18nService';

/**
 * Composant ErrorBoundary pour capturer et gérer les erreurs React
 * @component
 * @param {Object} props - Les props du composant
 * @param {React.ReactNode} props.children - Les composants enfants à protéger
 * @param {string} [props.customMessage] - Message d'erreur personnalisé
 * @param {Function} [props.onError] - Callback appelé lors d'une erreur
 * @param {string} [props.fallbackComponent] - Composant de fallback personnalisé
 * @example
 * <ErrorBoundary customMessage="Erreur dans le module utilisateur">
 *   <UserModule />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  /**
   * Méthode statique appelée lors d'une erreur pour mettre à jour l'état
   * @param {Error} error - L'erreur qui s'est produite
   * @returns {Object} Nouvel état avec hasError à true
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Méthode appelée après qu'une erreur ait été capturée
   * @param {Error} error - L'erreur qui s'est produite
   * @param {Object} errorInfo - Informations sur l'erreur
   */
  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log l'erreur pour le debugging
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Fonction pour réinitialiser l'état d'erreur et permettre un nouveau rendu
   */
  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            textAlign: 'center'
          }}
        >
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="error.main">
            {i18nService.t('errors.unexpected.title')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, maxWidth: 600 }}>
            {i18nService.t('errors.unexpected.message')}
          </Typography>
          
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
            <Typography variant="body2">
              {this.state.error?.message || i18nService.t('errors.unexpected.unknown')}
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={this.handleRetry}
              sx={{ minWidth: 120 }}
            >
              {i18nService.t('errors.unexpected.retry')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{ minWidth: 120 }}
            >
              {i18nService.t('errors.unexpected.reload')}
            </Button>
          </Box>

          {this.state.errorInfo && (
            <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxWidth: 800, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                {i18nService.t('errors.unexpected.details')}
              </Typography>
              <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 