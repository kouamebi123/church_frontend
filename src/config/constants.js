import { API_URL } from './apiConfig';

// Configuration de l'application
export const APP_CONFIG = {
  name: 'ACER HUB',
  version: '1.0.0',
  api: {
    baseUrl: API_URL,
    timeout: 30000, // Augmenté à 30 secondes pour les requêtes lourdes
    retryAttempts: 3
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100]
  },
  upload: {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles: 5
  },
  session: {
    timeout: 30 * 60 * 1000, // 30 minutes
    refreshThreshold: 5 * 60 * 1000 // 5 minutes
  }
};

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action',
  FORBIDDEN: 'Accès interdit',
  NOT_FOUND: 'Ressource non trouvée',
  VALIDATION_ERROR: 'Données invalides',
  SERVER_ERROR: 'Erreur serveur',
  UNKNOWN_ERROR: 'Une erreur inattendue est survenue',
  TIMEOUT_ERROR: 'Délai d\'attente dépassé',
  FILE_TOO_LARGE: 'Le fichier est trop volumineux',
  INVALID_FILE_TYPE: 'Type de fichier non autorisé',
  REQUIRED_FIELD: 'Ce champ est requis',
  INVALID_EMAIL: 'Adresse email invalide',
  INVALID_PHONE: 'Numéro de téléphone invalide',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 6 caractères',
  PASSWORDS_DONT_MATCH: 'Les mots de passe ne correspondent pas'
};

// Messages de succès standardisés
export const SUCCESS_MESSAGES = {
  CREATED: 'Élément créé avec succès',
  UPDATED: 'Élément mis à jour avec succès',
  DELETED: 'Élément supprimé avec succès',
  SAVED: 'Modifications enregistrées',
  UPLOADED: 'Fichier téléchargé avec succès',
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  PASSWORD_CHANGED: 'Mot de passe modifié avec succès',
  PROFILE_UPDATED: 'Profil mis à jour avec succès'
};

// Statuts de chargement
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed'
};

// Types d'actions
export const ACTION_TYPES = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list'
};

// Rôles utilisateur
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super-admin',
  MANAGER: 'manager',
  SUPERVISEUR: 'superviseur',
  COLLECTEUR_RESEAUX: 'collecteur_reseaux',
  COLLECTEUR_CULTE: 'collecteur_culte',
  MEMBRE: 'membre',
  GOUVERNANCE: 'gouvernance'
};

// Permissions par rôle
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: ['*'],
  [USER_ROLES.ADMIN]: [
    'users:read',
    'networks:read',
    'groups:read',
    'services:read',
    'churches:read',
    'stats:read',
    'messages:read',
    'messages:send',
    'messages:receive'
  ],
  [USER_ROLES.MANAGER]: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'networks:read',
    'networks:create',
    'networks:update',
    'networks:delete',
    'groups:read',
    'groups:create',
    'groups:update',
    'groups:delete',
    'services:read',
    'services:create',
    'services:update',
    'services:delete',
    'stats:read',
    'dashboard:read',
    'dashboard:write',
    'messages:read',
    'messages:receive'
  ],
  [USER_ROLES.SUPERVISEUR]: [
    'users:read',
    'users:update',
    'networks:read',
    'networks:update',
    'groups:read',
    'groups:update',
    'services:read',
    'services:create',
    'services:update',
    'messages:read',
    'messages:receive'
  ],
  [USER_ROLES.COLLECTEUR_RESEAUX]: [
    'networks:read',
    'networks:update',
    'groups:read',
    'groups:update',
    'users:read',
    'messages:read',
    'messages:receive'
  ],
  [USER_ROLES.COLLECTEUR_CULTE]: [
    'services:read',
    'services:create',
    'services:update',
    'users:read',
    'messages:read',
    'messages:receive'
  ],
  [USER_ROLES.MEMBRE]: [
    'profile:read',
    'profile:update',
    'networks:read',
    'groups:read',
    'messages:read',
    'messages:receive'
  ],
  [USER_ROLES.GOUVERNANCE]: [
    'users:read',
    'networks:read',
    'groups:read',
    'services:read',
    'stats:read',
    'messages:read',
    'messages:receive'
  ]
};

// Validation des formulaires
export const VALIDATION_RULES = {
  username: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    pattern: /^[\+]?[0-9\s\-\(\)]{8,}$/
  },
  password: {
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/
  }
};

// Configuration des tableaux
export const TABLE_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 25, 50],
  sortable: true,
  searchable: true,
  selectable: false
};

// Configuration des notifications
export const NOTIFICATION_CONFIG = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
};

// Thèmes de couleurs
export const THEME_COLORS = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3'
};

// Breakpoints responsive
export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920
}; 