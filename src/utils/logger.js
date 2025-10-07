/**
 * Logger centralisé pour l'application frontend
 * Gère les logs de manière cohérente avec différents niveaux
 * @namespace logger
 */

// Configuration du logger
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Niveau de log actuel (peut être configuré via variable d'environnement)
const CURRENT_LOG_LEVEL = import.meta.env.MODE === 'production' ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;

/**
 * Formate un message de log avec timestamp et niveau
 * @param {string} level - Niveau du log
 * @param {string} message - Message à logger
 * @param {*} data - Données additionnelles
 * @returns {string} Message formaté
 */
const formatLogMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  if (data !== null && data !== undefined) {
    return `${prefix} ${message} | Data: ${JSON.stringify(data, null, 2)}`;
  }
  
  return `${prefix} ${message}`;
};

/**
 * Logger centralisé avec gestion des niveaux
 */
const logger = {
  /**
   * Log d'erreur - toujours affiché
   * @param {string} message - Message d'erreur
   * @param {*} data - Données additionnelles
   */
  error: (message, data = null) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
      const formattedMessage = formatLogMessage('ERROR', message, data);
      console.error(`❌ ${formattedMessage}`);
      
      // En production, envoyer les erreurs à un service de monitoring
      if (import.meta.env.MODE === 'production') {
        // TODO: Intégrer avec un service comme Sentry, LogRocket, etc.
        // sendToMonitoring('error', message, data);
      }
    }
  },
  
  /**
   * Log d'avertissement
   * @param {string} message - Message d'avertissement
   * @param {*} data - Données additionnelles
   */
  warn: (message, data = null) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
      const formattedMessage = formatLogMessage('WARN', message, data);
      console.warn(`⚠️ ${formattedMessage}`);
    }
  },
  
  /**
   * Log d'information
   * @param {string} message - Message d'information
   * @param {*} data - Données additionnelles
   */
  info: (message, data = null) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      const formattedMessage = formatLogMessage('INFO', message, data);
      console.info(`ℹ️ ${formattedMessage}`);
    }
  },
  
  /**
   * Log de débogage - seulement en développement
   * @param {string} message - Message de débogage
   * @param {*} data - Données additionnelles
   */
  debug: (message, data = null) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      const formattedMessage = formatLogMessage('DEBUG', message, data);
      console.log(`🐛 ${formattedMessage}`);
    }
  },
  
  /**
   * Log de performance - pour mesurer les performances
   * @param {string} operation - Nom de l'opération
   * @param {number} startTime - Temps de début
   * @param {*} data - Données additionnelles
   */
  performance: (operation, startTime, data = null) => {
    const duration = performance.now() - startTime;
    const message = `${operation} completed in ${duration.toFixed(2)}ms`;
    
    if (duration > 1000) {
      logger.warn(`Slow operation: ${message}`, data);
    } else {
      logger.debug(`Performance: ${message}`, data);
    }
  },
  
  /**
   * Log de groupe - pour organiser les logs
   * @param {string} groupName - Nom du groupe
   * @param {Function} callback - Fonction à exécuter dans le groupe
   */
  group: (groupName, callback) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      console.group(`📁 ${groupName}`);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  },
  
  /**
   * Log de table - pour afficher des données tabulaires
   * @param {string} message - Message descriptif
   * @param {Array|Object} data - Données à afficher en tableau
   */
  table: (message, data) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      console.log(`📊 ${message}`);
      console.table(data);
    }
  }
};

export default logger;
