// Import des services principaux
import authService from './authService';
import apiService from './apiService';
import preferencesService from './preferencesService';
import i18nService from './i18nService';
import previsionnelService from './previsionnelService';
import assistanceService from './assistanceService';
import chaineImpactService from './chaineImpactService';
import activityService from './activityService';
import logger from '@utils/logger';


// Import des services de thème
import themeService from '../theme/themeService';

// Export des services principaux
export { default as authService } from './authService';
export { default as apiService } from './apiService';
export { default as preferencesService } from './preferencesService';
export { default as i18nService } from './i18nService';
export { default as previsionnelService } from './previsionnelService';
export { default as assistanceService } from './assistanceService';
export { default as chaineImpactService } from './chaineImpactService';
export { default as activityService } from './activityService';

// Export des services de thème
export { default as themeService } from '../theme/themeService';

// Export des constantes
export * from '@constants/enums';
export * from '@constants/countries';

// Export des hooks
export { useInitialData } from '@hooks/useInitialData';

// Export des composants
export { default as UserPreferences } from '@components/UserPreferences';

// Export des configurations
export * from '../config/preferences';

// Export des thèmes
export * from '../theme';

// Export des traductions
export * from '../assets/i18n/fr.json';
export * from '../assets/i18n/en.json';

// Export des utilitaires de validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validateUsername = (username) => {
  return username && username.length >= 3;
};

// Export des utilitaires de formatage
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('fr-FR');
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('fr-FR');
};

// Export des utilitaires de stockage
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      // logger.warn('Erreur lors de la récupération depuis localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      // logger.warn('Erreur lors de la sauvegarde dans localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      // logger.warn('Erreur lors de la suppression depuis localStorage:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      // logger.warn('Erreur lors du nettoyage de localStorage:', error);
      return false;
    }
  }
};

// Export des utilitaires de débogage
export const debug = {
  log: (message, data) => {
    // Log debug supprimé
  },
  
  warn: (message, data) => {
    // logger.warn(`⚠️ [DEBUG] ${message}`, data);
  },
  
  error: (message, error) => {
    // logger.error(`❌ [DEBUG] ${message}`, error);
  }
};

// Export des utilitaires de performance
export const performance = {
  measure: (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    // Performance log supprimé
    return result;
  },
  
  measureAsync: async (name, fn) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    // Performance log supprimé
    return result;
  }
};

// Export des utilitaires de sécurité
export const security = {
  sanitizeInput: (input) => {
    // Nettoyage basique des entrées utilisateur
    return input.replace(/[<>]/g, '');
  },
  
  generateToken: () => {
    // Génération d'un token simple
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },
  
  validateToken: (token) => {
    // Validation basique d'un token
    return token && token.length > 10;
  }
};

// Export des utilitaires de réseau
export const network = {
  isOnline: () => navigator.onLine,
  
  isSlowConnection: () => {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType === 'slow-2g' || 
             navigator.connection.effectiveType === '2g';
    }
    return false;
  },
  
  getConnectionInfo: () => {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      };
    }
    return null;
  }
};

// Export des utilitaires d'accessibilité
export const accessibility = {
  isHighContrast: () => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },
  
  isReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  isScreenReader: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

// Export par défaut
export default {
  // Services
  authService,
  apiService,
  preferencesService,
  i18nService,
  themeService,
  previsionnelService,
  assistanceService,
  chaineImpactService,
  activityService,
  
  // Utilitaires
  validateEmail,
  validatePassword,
  validateUsername,
  formatDate,
  formatTime,
  formatDateTime,
  storage,
  debug,
  performance,
  security,
  network,
  accessibility
};
