import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { API_URL } from '../config/apiConfig';

// Composant de protection CSRF qui vérifie automatiquement la validité
const CSRFProtection = ({ children, onTokenExpired }) => {
  const dispatch = useDispatch();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateCSRFToken = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const csrfToken = sessionStorage.getItem('csrfToken');
        
        if (!token || !csrfToken) {
          dispatch(logout());
          setIsValid(false);
          setIsValidating(false);
          return;
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
          dispatch(logout());
          setIsValid(false);
          setIsValidating(false);
          return;
        }

        if (response.status === 403) {
          
          // Essayer de régénérer le token
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
              setIsValid(true);
              setIsValidating(false);
              return;
            }
          }
          
          // Impossible de régénérer, déconnecter
          dispatch(logout());
          setIsValid(false);
          setIsValidating(false);
          return;
        }

        if (response.ok) {
          setIsValid(true);
          setIsValidating(false);
        } else {
          dispatch(logout());
          setIsValid(false);
          setIsValidating(false);
        }
      } catch (error) {
        // Erreur lors de la validation du token CSRF
        dispatch(logout());
        setIsValid(false);
        setIsValidating(false);
      }
    };

    validateCSRFToken();

    // Vérifier périodiquement la validité du token (toutes les 5 minutes)
    const interval = setInterval(validateCSRFToken, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Écouter les événements de déconnexion forcée
  useEffect(() => {
    const handleForceLogout = (event) => {
      setIsValid(false);
      setIsValidating(false);
      
      if (onTokenExpired) {
        onTokenExpired(event.detail?.reason);
      }
    };

    window.addEventListener('forceLogout', handleForceLogout);
    return () => window.removeEventListener('forceLogout', handleForceLogout);
  }, [onTokenExpired]);

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de la sécurité...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return null; // L'utilisateur sera redirigé par le dispatch logout
  }

  return children;
};

export default CSRFProtection;
