import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '../features/auth/authSlice';

/**
 * Hook pour gérer les mises à jour de rôle en temps réel
 * Force la re-synchronisation des données utilisateur après un changement de rôle
 */
export const useRoleUpdate = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastRoleChange, setLastRoleChange] = useState(null);

  // Fonction pour forcer la mise à jour des données utilisateur
  const updateUserData = async () => {
    if (isUpdating) return; // Éviter les mises à jour multiples simultanées
    
    setIsUpdating(true);
    try {
      await dispatch(getMe()).unwrap();
      console.log('✅ Données utilisateur mises à jour après changement de rôle');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des données utilisateur:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Détecter les changements de rôle
  useEffect(() => {
    if (user?.current_role && user.current_role !== lastRoleChange) {
      console.log(`🔄 Rôle changé de ${lastRoleChange} vers ${user.current_role}`);
      setLastRoleChange(user.current_role);
      
      // Forcer la mise à jour des données
      updateUserData();
    }
  }, [user?.current_role, lastRoleChange]);

  // Initialiser le dernier rôle connu
  useEffect(() => {
    if (user?.current_role && !lastRoleChange) {
      setLastRoleChange(user.current_role);
    }
  }, [user?.current_role, lastRoleChange]);

  return {
    isUpdating,
    updateUserData,
    currentRole: user?.current_role || user?.role,
    lastRoleChange
  };
};
