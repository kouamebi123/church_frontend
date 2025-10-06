import { activityService } from '../services';

/**
 * Enregistre une activité dans l'historique
 * @param {string} action - L'action effectuée (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW, EXPORT, IMPORT)
 * @param {string} entityType - Le type d'entité (USER, NETWORK, GROUP, SERVICE, CHURCH, DEPARTMENT, TESTIMONY, CAROUSEL, PREVISIONNEL, ASSISTANCE, MESSAGE)
 * @param {string} entityId - L'ID de l'entité concernée
 * @param {string} entityName - Le nom de l'entité concernée
 * @param {string} details - Détails supplémentaires sur l'action
 */
export const logActivity = async (action, entityType, entityId = null, entityName = null, details = null) => {
  // Ne pas logger si on est en mode développement et que l'utilisateur n'est pas connecté
  if (!sessionStorage.getItem('token')) {
    return;
  }

  // Vérifier si l'utilisateur est connecté
  if (!sessionStorage.getItem('token')) {
    return;
  }

  // Exécuter de manière asynchrone sans bloquer l'interface
  activityService.logActivity({
    action,
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    details
  }).catch(() => {
    // Ignorer silencieusement les erreurs de logging
    // L'activité n'est pas critique pour le fonctionnement de l'app
  });
};

/**
 * Actions prédéfinies pour faciliter l'utilisation
 */
export const ActivityActions = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  VIEW: 'VIEW',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT'
};

/**
 * Types d'entités prédéfinis
 */
export const EntityTypes = {
  USER: 'USER',
  NETWORK: 'NETWORK',
  GROUP: 'GROUP',
  SERVICE: 'SERVICE',
  CHURCH: 'CHURCH',
  DEPARTMENT: 'DEPARTMENT',
  TESTIMONY: 'TESTIMONY',
  CAROUSEL: 'CAROUSEL',
  PREVISIONNEL: 'PREVISIONNEL',
  ASSISTANCE: 'ASSISTANCE',
  MESSAGE: 'MESSAGE'
};
