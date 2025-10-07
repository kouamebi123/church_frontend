import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { API_URL } from '../config/apiConfig';
import logger from '@utils/logger';


// Hook pour gérer automatiquement les tokens CSRF
export const useCSRF = () => {
  const dispatch = useDispatch();

  // Fonction pour vérifier la validité du token CSRF
  const checkCSRFToken = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      const csrfToken = sessionStorage.getItem('csrfToken');
      
      if (!token || !csrfToken) {
        // Pas de tokens, déconnecter
        dispatch(logout());
        return false;
      }

      // Vérifier la validité en appelant l'API
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        // Token expiré, déconnecter
        dispatch(logout());
        return false;
      }

      if (response.status === 403) {
        // Erreur CSRF, essayer de régénérer
        const refreshResponse = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (refreshResponse.ok) {
          const newCSRFToken = refreshResponse.headers.get('X-CSRF-Token');
          if (newCSRFToken) {
            sessionStorage.setItem('csrfToken', newCSRFToken);
            return true;
          }
        }
        
        // Impossible de régénérer, déconnecter
        dispatch(logout());
        return false;
      }

      return true;
    } catch (error) {
      // logger.error('Erreur lors de la vérification du token CSRF:', error);
      dispatch(logout());
      return false;
    }
  }, [dispatch]);

  // Vérifier le token CSRF au montage du composant
  useEffect(() => {
    checkCSRFToken();
  }, [checkCSRFToken]);

  // Vérifier le token CSRF avant les actions sensibles
  const validateBeforeAction = useCallback(async (action) => {
    const isValid = await checkCSRFToken();
    if (isValid) {
      return action();
    }
    return false;
  }, [checkCSRFToken]);

  return {
    checkCSRFToken,
    validateBeforeAction
  };
};

export default useCSRF;
