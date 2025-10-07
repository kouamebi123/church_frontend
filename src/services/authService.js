import axios from 'axios';
import { handleApiError, handleTimeoutError, handleConnectionError } from '@utils/errorHandler';
import { API_URL } from '../config/apiConfig';

/**
 * Service d'authentification pour la gestion des utilisateurs
 * @namespace authService
 */

// Configuration axios avec intercepteurs
const authAxios = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Augmenté à 30 secondes pour les requêtes lourdes
  withCredentials: true, // Important pour CORS avec credentials
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour ajouter automatiquement le token et le token CSRF
authAxios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    

    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
authAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      // Vérifier si c'est vraiment une erreur d'authentification ou juste de permissions
      const errorMessage = error.response?.data?.message || '';
      const errorCode = error.response?.data?.code || '';
      
      // Si c'est une erreur de permissions (pas d'authentification), ne pas déconnecter
      if (errorMessage.includes('droits') || 
          errorMessage.includes('autorisé') || 
          errorMessage.includes('permissions') ||
          errorMessage.includes('église')) {
        // C'est une erreur de permissions, pas d'authentification
        // Ne pas déconnecter, juste rejeter l'erreur
        return Promise.reject(error);
      }
      
      // Si c'est une erreur CSRF expiré, déconnecter automatiquement
      if (errorCode === 'CSRF_TOKEN_EXPIRED' || errorMessage.includes('Session expirée')) {
        
        // Supprimer les tokens
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('csrfToken');
        
        // Déclencher la déconnexion Redux via un événement personnalisé
        const logoutEvent = new CustomEvent('forceLogout', {
          detail: { reason: 'Session CSRF expirée' }
        });
        window.dispatchEvent(logoutEvent);
        
        // Rediriger vers la page de connexion
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Si c'est vraiment une erreur d'authentification (token expiré, invalide, etc.)
      if (errorMessage.includes('token') || 
          errorMessage.includes('expiré') || 
          errorMessage.includes('Non autorisé') ||
          errorMessage.includes('authentifié')) {
        
        // Supprimer les tokens
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('csrfToken');
        
        // Déclencher la déconnexion Redux via un événement personnalisé
        const logoutEvent = new CustomEvent('forceLogout', {
          detail: { reason: 'Token expiré ou invalide' }
        });
        window.dispatchEvent(logoutEvent);
        
        // Rediriger vers la page de connexion
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
    
    // Gestion des erreurs CSRF
    if (error.response?.status === 403) {
      const errorCode = error.response?.data?.code || '';
      
      if (errorCode === 'CSRF_TOKEN_MISSING' || errorCode === 'CSRF_TOKEN_INVALID') {
        
        // Essayer de régénérer le token en appelant /api/auth/me
        try {
          const refreshResponse = await authAxios.get('/auth/me');
          if (refreshResponse.data.csrfToken) {
            // Réessayer la requête originale avec le nouveau token
            const originalConfig = error.config;
            const newToken = refreshResponse.data.csrfToken;
            originalConfig.headers['X-CSRF-Token'] = newToken;
            return authAxios(originalConfig);
          }
        } catch (refreshError) {
        }
      }
    }
    
    // Gestion des timeouts
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      error.userMessage = 'Délai d\'attente dépassé. Vérifiez votre connexion internet.';
      return Promise.reject(error);
    }
    
    // Gestion des erreurs de connexion
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      error.userMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
      return Promise.reject(error);
    }
    
    // Traitement général des erreurs
    const processedError = handleApiError(error, 'requête API');
    error.userMessage = processedError.message;
    error.errorType = processedError.type;
    
    return Promise.reject(error);
  }
);

// Service d'authentification
export const authService = {
  // Stockage sécurisé du token (sessionStorage au lieu de localStorage)
  setToken: (token) => {
    sessionStorage.setItem('token', token);
  },

  getToken: () => {
    return sessionStorage.getItem('token');
  },

  removeToken: () => {
    sessionStorage.removeItem('token');
  },

  // Stockage de l'utilisateur dans sessionStorage
  setUser: (user) => {
    sessionStorage.setItem('user', JSON.stringify(user));
  },

  getUser: () => {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  removeUser: () => {
    sessionStorage.removeItem('user');
  },

  // Méthodes d'authentification
  login: async (credentials) => {
    try {
      const response = await authAxios.post('/auth/login', credentials);
      if (response.data.token) {
        authService.setToken(response.data.token);
      }
      if (response.data.user) {
        authService.setUser(response.data.user);
      }
      if (response.data.csrfToken) {
        sessionStorage.setItem('csrfToken', response.data.csrfToken);
      }
      return response.data;
    } catch (error) {
      // Utiliser le message d'erreur traité par l'intercepteur
      const message = error.userMessage || error.response?.data?.message || 'Erreur de connexion';
      throw new Error(message);
    }
  },

  register: async (userData) => {
    try {
      const response = await authAxios.post('/auth/register', userData);
      if (response.data.token) {
        authService.setToken(response.data.token);
      }
      if (response.data.user) {
        authService.setUser(response.data.user);
      }
      if (response.data.csrfToken) {
        sessionStorage.setItem('csrfToken', response.data.csrfToken);
      }
      return response.data;
    } catch (error) {
      const message = error.userMessage || error.response?.data?.message || 'Erreur d\'inscription';
      throw new Error(message);
    }
  },

  registerWithImage: async (formData) => {
    try {
      // Configuration spéciale pour l'upload de fichier
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      };
      
      const response = await authAxios.post('/auth/register', formData, config);
      if (response.data.token) {
        authService.setToken(response.data.token);
      }
      if (response.data.user) {
        authService.setUser(response.data.user);
      }
      if (response.data.csrfToken) {
        sessionStorage.setItem('csrfToken', response.data.csrfToken);
      }
      return response.data;
    } catch (error) {
      const message = error.userMessage || error.response?.data?.message || 'Erreur d\'inscription avec image';
      throw new Error(message);
    }
  },

  getMe: async () => {
    try {
      const response = await authAxios.get('/auth/me');
      if (response.data.data) {
        authService.setUser(response.data.data);
      }
      return response.data;
    } catch (error) {
      const message = error.userMessage || error.response?.data?.message || 'Erreur de récupération du profil';
      throw new Error(message);
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await authAxios.put('/auth/updatedetails', userData);
      if (response.data.data) {
        authService.setUser(response.data.data);
      }
      return response.data;
    } catch (error) {
      const message = error.userMessage || error.response?.data?.message || 'Erreur de mise à jour du profil';
      throw new Error(message);
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const response = await authAxios.put('/auth/updatepassword', passwordData);
      if (response.data.token) {
        authService.setToken(response.data.token);
      }
      if (response.data.user) {
        authService.setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      const message = error.userMessage || error.response?.data?.message || 'Erreur de mise à jour du mot de passe';
      throw new Error(message);
    }
  },

  logout: () => {
    authService.removeToken();
    authService.removeUser();
    sessionStorage.removeItem('csrfToken');
    // Redirection vers la page de connexion
    window.location.href = '/login';
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: () => {
    return !!authService.getToken() && !!authService.getUser();
  }
};

export default authAxios; 