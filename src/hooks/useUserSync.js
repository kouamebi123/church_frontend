import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '@features/auth/authSlice';
import logger from '@utils/logger';
import { API_BASE_URL } from '../config/apiConfig';


/**
 * Hook personnalisé pour synchroniser l'utilisateur et son image de profil
 * Résout le problème de photo non affichée après connexion/inscription
 */
export const useUserSync = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const [isUserFullyLoaded, setIsUserFullyLoaded] = useState(false);
  const [userImage, setUserImage] = useState(null);

  useEffect(() => {
    // Si l'utilisateur est authentifié mais pas complètement chargé
    if (isAuthenticated && user && !isUserFullyLoaded) {
      // Vérifier si l'utilisateur a une image
      if (user.image) {
        setUserImage(user.image);
        setIsUserFullyLoaded(true);
      } else {
        // Si pas d'image, l'utilisateur est quand même considéré comme chargé
        setIsUserFullyLoaded(true);
      }
    }
  }, [user, isAuthenticated, isUserFullyLoaded]);

  // Synchroniser l'image avec les changements de l'utilisateur dans le store
  useEffect(() => {
    if (user && user.image !== userImage) {
      setUserImage(user.image);
    }
  }, [user?.image, userImage]);

  // Fonction pour forcer la synchronisation
  const syncUser = async () => {
    if (isAuthenticated) {
      try {
        const result = await dispatch(getMe()).unwrap();
        setIsUserFullyLoaded(true);
        return result;
      } catch (error) {
        // logger.error('Erreur lors de la synchronisation de l\'utilisateur:', error);
        throw error;
      }
    }
  };

  // Fonction pour obtenir l'URL complète de l'image
  const getUserImageUrl = () => {
    // Utiliser userImage en priorité, sinon utiliser user.image
    const imageToUse = userImage || user?.image;
    
    if (!imageToUse) return null;
    
    // Si c'est déjà une URL complète
    if (imageToUse.startsWith('http')) {
      return imageToUse;
    }
    
    // Construire l'URL complète
    return `${API_BASE_URL}/${imageToUse}`;
  };

  // Fonction pour vérifier si l'image est en cours de chargement
  const isImageLoading = () => {
    return isAuthenticated && !isUserFullyLoaded;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isUserFullyLoaded,
    userImage,
    getUserImageUrl,
    isImageLoading,
    syncUser
  };
};
