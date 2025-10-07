import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);

  // Vérifier l'authentification uniquement via le state Redux
  const isUserAuthenticated = isAuthenticated && user && token;

  if (!isUserAuthenticated) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
