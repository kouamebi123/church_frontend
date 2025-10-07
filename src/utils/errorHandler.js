/**
 * Gestionnaire d'erreurs centralisé pour l'application
 */
import logger from './logger';

/**
 * Gère les erreurs API de manière uniforme
 * @param {Error} error - L'erreur à traiter
 * @param {string} context - Contexte de l'erreur (ex: "fetching users")
 * @returns {string} Message d'erreur formaté pour l'utilisateur
 */
export const handleApiError = (error, context = '') => {
  // Log de l'erreur pour le debugging
  logger.error(`Erreur API [${context}]`, error);

  // Gestion des différents types d'erreurs
  if (error.response) {
    // Erreur de réponse du serveur
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data?.message || 'Données invalides. Veuillez vérifier vos informations.';
      case 401:
        return 'Session expirée. Veuillez vous reconnecter.';
      case 403:
        return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
      case 404:
        return data?.message || 'Ressource introuvable.';
      case 409:
        return data?.message || 'Conflit de données. Cette ressource existe déjà.';
      case 422:
        return data?.message || 'Données de validation invalides.';
      case 429:
        return 'Trop de requêtes. Veuillez patienter avant de réessayer.';
      case 500:
        return 'Erreur serveur interne. Veuillez réessayer plus tard.';
      case 502:
        return 'Service temporairement indisponible. Veuillez réessayer.';
      case 503:
        return 'Service en maintenance. Veuillez réessayer plus tard.';
      default:
        return data?.message || `Erreur serveur (${status}). Veuillez réessayer.`;
    }
  } else if (error.request) {
    // Erreur de requête (pas de réponse)
    if (error.code === 'ECONNABORTED') {
      return 'Délai d\'attente dépassé. Vérifiez votre connexion internet.';
    }
    return 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
  } else {
    // Erreur de configuration ou autre
    if (error.message) {
      return error.message;
    }
    return 'Une erreur inattendue s\'est produite.';
  }
};

/**
 * Gère les erreurs de validation
 * @param {Object} validationErrors - Erreurs de validation
 * @returns {string} Message d'erreur formaté
 */
export const handleValidationError = (validationErrors) => {
  if (!validationErrors || typeof validationErrors !== 'object') {
    return 'Erreur de validation des données.';
  }

  const messages = Object.values(validationErrors).filter(Boolean);
  if (messages.length === 0) {
    return 'Erreur de validation des données.';
  }

  return messages.join('. ');
};

/**
 * Gère les erreurs de permissions
 * @param {string} requiredPermission - Permission requise
 * @returns {string} Message d'erreur formaté
 */
export const handlePermissionError = (requiredPermission) => {
  return `Permission insuffisante. Action requise: ${requiredPermission}`;
};

/**
 * Gère les erreurs de réseau
 * @param {Error} error - Erreur réseau
 * @returns {string} Message d'erreur formaté
 */
export const handleNetworkError = (error) => {
  if (error.code === 'NETWORK_ERROR') {
    return 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
  }
  
  if (error.code === 'TIMEOUT') {
    return 'Délai d\'attente dépassé. Le serveur met trop de temps à répondre.';
  }

  return 'Erreur de connexion. Veuillez réessayer.';
};

/**
 * Gère les erreurs de base de données
 * @param {Error} error - Erreur de base de données
 * @returns {string} Message d'erreur formaté
 */
export const handleDatabaseError = (error) => {
  if (error.code === 'P2002') {
    return 'Cette ressource existe déjà. Veuillez utiliser des informations uniques.';
  }
  
  if (error.code === 'P2025') {
    return 'Ressource introuvable. Elle a peut-être été supprimée.';
  }

  if (error.code === 'P2003') {
    return 'Impossible de supprimer cette ressource car elle est utilisée ailleurs.';
  }

  return 'Erreur de base de données. Veuillez réessayer.';
};

/**
 * Gère les erreurs de sécurité
 * @param {Error} error - Erreur de sécurité
 * @returns {string} Message d'erreur formaté
 */
export const handleSecurityError = (error) => {
  if (error.code === 'JWT_EXPIRED') {
    return 'Session expirée. Veuillez vous reconnecter.';
  }
  
  if (error.code === 'JWT_INVALID') {
    return 'Session invalide. Veuillez vous reconnecter.';
  }

  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    return 'Trop de tentatives. Veuillez patienter avant de réessayer.';
  }

  if (error.code === 'CSRF_INVALID') {
    return 'Token de sécurité invalide. Veuillez recharger la page.';
  }

  return 'Erreur de sécurité. Veuillez vous reconnecter.';
};

/**
 * Gère les erreurs génériques
 * @param {Error} error - Erreur générique
 * @param {string} fallbackMessage - Message de fallback
 * @returns {string} Message d'erreur formaté
 */
export const handleGenericError = (error, fallbackMessage = 'Une erreur inattendue s\'est produite.') => {
  if (error && typeof error === 'object' && error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }

  return fallbackMessage;
};

/**
 * Gestionnaire d'erreurs principal
 * @param {Error} error - L'erreur à traiter
 * @param {Object} options - Options de gestion
 * @returns {string} Message d'erreur formaté
 */
export const handleError = (error, options = {}) => {
  const {
    context = '',
    fallbackMessage = 'Une erreur inattendue s\'est produite.',
    logError = true
  } = options;

  // Log de l'erreur si demandé
  if (logError) {
    logger.error(`Erreur [${context}]`, error);
  }

  // Tentative de classification automatique de l'erreur
  if (error.response) {
    return handleApiError(error, context);
  }
  
  if (error.code && error.code.startsWith('P')) {
    return handleDatabaseError(error);
  }
  
  if (error.code && (error.code.includes('JWT') || error.code.includes('RATE_LIMIT') || error.code.includes('CSRF'))) {
    return handleSecurityError(error);
  }
  
  if (error.code && (error.code.includes('NETWORK') || error.code.includes('TIMEOUT'))) {
    return handleNetworkError(error);
  }

  return handleGenericError(error, fallbackMessage);
};

/**
 * Extrait le message d'erreur d'un objet Error
 * @param {Error|string|Object} error - L'erreur à analyser
 * @param {string} fallbackMessage - Message de fallback
 * @returns {string} Message d'erreur
 */
export const getErrorMessage = (error, fallbackMessage = 'Une erreur inattendue s\'est produite') => {
  if (error && typeof error === 'object' && error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }

  return fallbackMessage;
};

/**
 * Log une erreur avec un contexte optionnel
 * @param {Error} error - L'erreur à logger
 * @param {string} context - Contexte de l'erreur
 */
export const logError = (error, context = '') => {
  const message = context ? `Erreur [${context}]:` : 'Erreur:';
  console.error(message, error);
};

/**
 * Gère les erreurs de timeout
 * @param {Error} error - Erreur de timeout
 * @returns {string} Message d'erreur formaté
 */
export const handleTimeoutError = (error) => {
  return 'Délai d\'attente dépassé. Le serveur met trop de temps à répondre.';
};

/**
 * Gère les erreurs de connexion
 * @param {Error} error - Erreur de connexion
 * @returns {string} Message d'erreur formaté
 */
export const handleConnectionError = (error) => {
  return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
};

export default {
  handleApiError,
  handleValidationError,
  handlePermissionError,
  handleNetworkError,
  handleDatabaseError,
  handleSecurityError,
  handleGenericError,
  handleError,
  getErrorMessage,
  logError,
  handleTimeoutError,
  handleConnectionError
};
