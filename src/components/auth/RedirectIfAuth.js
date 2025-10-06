import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RedirectIfAuth = ({ children }) => {
  const location = useLocation();
  const { user, token } = useSelector((state) => state.auth);
  const from = location.state?.from?.pathname || '/home';

  if (user && token) {
    // Rediriger vers la page d'accueil si l'utilisateur est déjà connecté
    return <Navigate to={from} replace />;
  }

  return children;
};

export default RedirectIfAuth;
