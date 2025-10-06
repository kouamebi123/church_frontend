import { useSelector, useDispatch } from 'react-redux';
import { handleApiError } from '../utils/errorHandler';
// Import supprimé car non utilisé
import { login, register, getMe, logout, updateUserProfile, updatePassword } from '../features/auth/authSlice';

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