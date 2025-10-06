import { useState, useEffect, useContext, createContext } from 'react';
import { handleApiError } from '../utils/errorHandler';
import { useSelector } from 'react-redux';
import { usePermissions } from './usePermissions';

// Contexte pour l'église sélectionnée
const SelectedChurchContext = createContext();

// Hook personnalisé pour utiliser l'église sélectionnée
export const useSelectedChurch = () => {
  const context = useContext(SelectedChurchContext);
  if (!context) {
    throw new Error('useSelectedChurch doit être utilisé dans un SelectedChurchProvider');
  }
  return context;
};

// Provider pour l'église sélectionnée
export const SelectedChurchProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const permissions = usePermissions();
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [churches, setChurches] = useState([]);
  

  // Charger les églises seulement si l'utilisateur est connecté
  useEffect(() => {
    const fetchChurches = async () => {
      try {
        // Utiliser l'apiService qui gère l'authentification
        const { apiService } = await import('../services/apiService');
        const response = await apiService.churches.getAll();
        const data = response.data?.data || response.data || [];
        setChurches(data);
      } catch (error) {
        setChurches([]);
      }
    };

    // Charger les églises seulement si l'utilisateur est connecté
    // Éviter les appels inutiles sur la page de login
    if (user) {
      fetchChurches();
    }
  }, [user]);

  // Initialiser l'église sélectionnée
  useEffect(() => {
    if (churches.length === 0) return; // Attendre que les églises soient chargées
    
    // Si on a déjà une église sélectionnée, ne pas la réinitialiser
    if (selectedChurch) {
      return;
    }
    
    // 1. D'abord, vérifier le localStorage pour restaurer la sélection précédente
    // Pour les admins/super-admins : toujours restaurer depuis localStorage
    // Pour les autres : seulement si pas d'église locale
    const savedChurchId = localStorage.getItem('selectedChurchId');
    
    if (savedChurchId && (permissions.isAdmin || permissions.isSuperAdmin || !user?.eglise_locale)) {
      const savedChurch = churches.find(church => (church.id || church._id) === savedChurchId);
      if (savedChurch) {
        setSelectedChurch(savedChurch);
        return; // Ne pas continuer si on a restauré depuis localStorage
      } else {
        localStorage.removeItem('selectedChurchId');
      }
    }
    
    // 2. Ensuite, vérifier l'église de l'utilisateur connecté
    // MAIS seulement si on n'a pas pu restaurer depuis localStorage
    // Pour les rôles non-admin : TOUJOURS utiliser leur église locale
    const isNonAdminRole = permissions.isManager || 
                           (user?.current_role || user?.role) === 'SUPERVISEUR' ||
                           (user?.current_role || user?.role) === 'COLLECTEUR_RESEAUX' ||
                           (user?.current_role || user?.role) === 'COLLECTEUR_CULTE';
    
    if (user?.eglise_locale && (!savedChurchId || isNonAdminRole)) {
      const userChurchId = typeof user.eglise_locale === 'object'
        ? (user.eglise_locale.id || user.eglise_locale._id)
        : user.eglise_locale;
      
      const userChurch = churches.find(church => (church.id || church._id) === userChurchId);
      if (userChurch) {
        setSelectedChurch(userChurch);
        // Sauvegarder dans localStorage
        localStorage.setItem('selectedChurchId', userChurchId);
        return;
      }
    }
    
    // 3. Enfin, utiliser la première église disponible (pour les super admins)
    // MAIS seulement si l'utilisateur n'a pas d'église locale
    if (!user?.eglise_locale && churches.length > 0) {
      setSelectedChurch(churches[0]);
      // Sauvegarder dans localStorage
      localStorage.setItem('selectedChurchId', churches[0].id || churches[0]._id);
    }
    
    // 4. Fallback pour les rôles non-admin : si aucune église n'est sélectionnée, forcer l'église locale
    if (isNonAdminRole && !selectedChurch && user?.eglise_locale && churches.length > 0) {
      const userChurchId = typeof user.eglise_locale === 'object'
        ? (user.eglise_locale.id || user.eglise_locale._id)
        : user.eglise_locale;
      
      const userChurch = churches.find(church => (church.id || church._id) === userChurchId);
      if (userChurch) {
        setSelectedChurch(userChurch);
        localStorage.setItem('selectedChurchId', userChurchId);
      }
    }
  }, [user, churches, selectedChurch, permissions.isAdmin, permissions.isSuperAdmin, permissions.isManager]); // Ajouté permissions.isManager

  // Effet pour forcer la réinitialisation quand l'utilisateur change (reconnexion)
  // MAIS seulement pour les utilisateurs non-admin (managers, membres, etc.)
  // ET seulement si l'utilisateur a changé (nouvelle connexion)
  useEffect(() => {
    if (user && churches.length > 0) {
      // Vérifier si l'église actuellement sélectionnée correspond à l'église de l'utilisateur
      // MAIS seulement si l'utilisateur n'est pas admin ou super-admin
      if (user.eglise_locale && !permissions.isAdmin && !permissions.isSuperAdmin) {
        const userChurchId = typeof user.eglise_locale === 'object'
          ? (user.eglise_locale.id || user.eglise_locale._id)
          : user.eglise_locale;
        
        const currentChurchId = selectedChurch?.id || selectedChurch?._id;
        
        // Si l'église sélectionnée ne correspond pas à l'église de l'utilisateur, la réinitialiser
        if (currentChurchId !== userChurchId) {
          const userChurch = churches.find(church => (church.id || church._id) === userChurchId);
          if (userChurch) {
            setSelectedChurch(userChurch);
            localStorage.setItem('selectedChurchId', userChurchId);
          }
        }
      }
    }
  }, [user?.id, user?.eglise_locale, churches, permissions.isAdmin, permissions.isSuperAdmin]); // Retiré selectedChurch des dépendances

  // Effet pour gérer la persistance lors des changements de page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedChurch) {
        localStorage.setItem('selectedChurchId', selectedChurch.id || selectedChurch._id);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && selectedChurch) {
        // Vérifier que l'église est toujours valide
        const savedChurchId = localStorage.getItem('selectedChurchId');
        if (savedChurchId !== (selectedChurch.id || selectedChurch._id)) {
          resetFromLocalStorage();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedChurch]);

  // Fonction pour changer l'église sélectionnée
  const changeSelectedChurch = (churchId) => {
    const church = churches.find(church => (church.id || church._id) === churchId);
    if (church) {
      setSelectedChurch(church);
      // Sauvegarder dans le localStorage pour la persistance
      localStorage.setItem('selectedChurchId', churchId);
    }
  };

  // Fonction pour forcer la réinitialisation depuis le localStorage
  const resetFromLocalStorage = () => {
    const savedChurchId = localStorage.getItem('selectedChurchId');
    if (savedChurchId && churches.length > 0) {
      const savedChurch = churches.find(church => (church.id || church._id) === savedChurchId);
      if (savedChurch) {
        setSelectedChurch(savedChurch);
        return true;
      }
    }
    return false;
  };

  // Fonction pour nettoyer le localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem('selectedChurchId');
  };

  const value = {
    selectedChurch,
    setSelectedChurch,
    changeSelectedChurch,
    churches,
    setChurches,
    resetFromLocalStorage,
    clearLocalStorage
  };

  return (
    <SelectedChurchContext.Provider value={value}>
      {children}
    </SelectedChurchContext.Provider>
  );
};
