import { useSelector, useDispatch } from 'react-redux';
import { handleApiError } from '@utils/errorHandler';
// Import supprimé car non utilisé
import { login, register, getMe, logout, updateUserProfile, updatePassword } from '@features/auth/authSlice';
import logger from '@utils/logger';


/**
 * Hook personnalisé pour la gestion de l'authentification
 * @returns {Object} Objet contenant l'état d'authentification et les fonctions de gestion
 * @returns {Object|null} returns.user - Utilisateur connecté ou null
 * @returns {string|null} returns.token - Token d'authentification ou null
 * @returns {boolean} returns.isAuthenticated - État de connexion
 * @returns {boolean} returns.isLoading - État de chargement
 * @returns {string|null} returns.error - Message d'erreur ou null
 * @returns {Function} returns.loginUser - Fonction de connexion
 * @returns {Function} returns.registerUser - Fonction d'inscription
 * @returns {Function} returns.logoutUser - Fonction de déconnexion
 * @returns {Function} returns.getUserProfile - Fonction de récupération du profil
 * @returns {Function} returns.updateUserProfile - Fonction de mise à jour du profil
 * @returns {Function} returns.updatePassword - Fonction de mise à jour du mot de passe
 * @example
 * const { user, isAuthenticated, loginUser } = useAuth();
 * 
 * if (isAuthenticated) {
 *   logger.debug('Utilisateur connecté:', user);
 * }
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const loginUser = async (credentials) => {
    try {
      await dispatch(login(credentials)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const registerUser = async (userData) => {
    try {
      await dispatch(register(userData)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getUserProfile = async () => {
    try {
      await dispatch(getMe()).unwrap();
      return { success: true };
    } catch (error) {
              // Vérifier si c'est une erreur d'église locale
        if (error.code === 'NO_CHURCH_ASSIGNMENT' || 
            error.code === 'CHURCH_NOT_FOUND') {
          return { 
            success: false, 
            error: error.message,
            code: error.code,
            requiresAction: error.requiresAction
          };
        }
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (userData) => {
    try {
      await dispatch(updateUserProfile(userData)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await dispatch(updatePassword(passwordData)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    loginUser,
    registerUser,
    getUserProfile,
    updateProfile,
    changePassword,
    logoutUser
  };
}; 