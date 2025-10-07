import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { handleApiError } from '@utils/errorHandler';
import { apiService } from '@services/apiService';

// Cache global pour stocker les données
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useApi = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cacheKey = useRef(null);
  const abortController = useRef(null);

  // Générer une clé de cache basée sur l'appel API et les dépendances
  useEffect(() => {
    cacheKey.current = JSON.stringify({ apiCall: apiCall.toString(), dependencies });
  }, [apiCall, dependencies]);

  useEffect(() => {
    const fetchData = async () => {
      // Vérifier le cache
      if (cache.has(cacheKey.current)) {
        const cachedData = cache.get(cacheKey.current);
        if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
          setData(cachedData.data);
          setLoading(false);
          return;
        } else {
          // Cache expiré, le supprimer
          cache.delete(cacheKey.current);
        }
      }

      // Annuler la requête précédente si elle existe
      if (abortController.current) {
        abortController.current.abort();
      }

      // Créer un nouveau contrôleur d'annulation
      abortController.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        
        // Vérifier si la requête n'a pas été annulée
        if (!abortController.current.signal.aborted) {
          const responseData = result.data?.data || result.data || result;
          setData(responseData);
          setError(null);

          // Mettre en cache
          cache.set(cacheKey.current, {
            data: responseData,
            timestamp: Date.now()
          });
        }
      } catch (err) {
        if (!abortController.current.signal.aborted) {
          setError(err.message || 'Une erreur est survenue');
          setData(null);
        }
      } finally {
        if (!abortController.current.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [apiCall, dependencies]);

  // Fonction pour forcer le rafraîchissement
  const refetch = async () => {
    if (cacheKey.current) {
      cache.delete(cacheKey.current);
    }
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      const responseData = result.data?.data || result.data || result;
      setData(responseData);
      
      // Mettre en cache
      cache.set(cacheKey.current, {
        data: responseData,
        timestamp: Date.now()
      });
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

// Hook spécialisé pour les statistiques avec cache plus long
export const useStatsApi = (apiCall, dependencies = []) => {
  return useApi(apiCall, dependencies, { cacheDuration: 10 * 60 * 1000 }); // 10 minutes
};

// Fonction utilitaire pour vider le cache
export const clearCache = () => {
  cache.clear();
};

// Fonction utilitaire pour vider le cache d'une clé spécifique
export const clearCacheKey = (key) => {
  cache.delete(key);
};

// Hook pour les utilisateurs
export const useUsers = (params = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stabiliser les paramètres pour éviter les rechargements inutiles
  const paramsString = JSON.stringify(params);
  const stableParams = useMemo(() => params, [paramsString]);

  const fetchUsers = useCallback(async (fetchParams = stableParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.users.getAll(fetchParams);
      setUsers(response.data?.data || response.data || []);
      return response;
    } catch (err) {
      // Ne jamais exposer les erreurs techniques à l'utilisateur
      const processedError = handleApiError(err, 'le chargement des utilisateurs');
      setError(processedError.message);
      // Créer une nouvelle erreur avec le message sécurisé
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [stableParams]);

  // Charger les utilisateurs seulement au montage initial ou quand les paramètres changent
  useEffect(() => {
    if (Object.keys(stableParams).length > 0) {
      fetchUsers();
    }
  }, [stableParams, fetchUsers]); // Ajouter fetchUsers comme dépendance

  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.users.create(userData);
      await fetchUsers(); // Recharger la liste
      return response;
    } catch (err) {
      // Ne jamais exposer les erreurs techniques à l'utilisateur
      const processedError = handleApiError(err, 'la création de l\'utilisateur');
      // Ne pas définir d'erreur globale - l'erreur sera gérée localement
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id, userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.users.update(id, userData);
      await fetchUsers(); // Recharger la liste
      return response;
    } catch (err) {
      // Ne jamais exposer les erreurs techniques à l'utilisateur
      const processedError = handleApiError(err, 'la mise à jour de l\'utilisateur');
      // Ne pas définir d'erreur globale - l'erreur sera gérée localement
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.users.delete(id);
      await fetchUsers(); // Recharger la liste
      return response;
    } catch (err) {
      // Ne jamais exposer les erreurs techniques à l'utilisateur
      const processedError = handleApiError(err, 'la suppression de l\'utilisateur');
      // Ne pas définir d'erreur globale - l'erreur sera gérée localement
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};

// Hook pour les réseaux
export const useNetworks = (params = {}) => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mémoriser les paramètres pour éviter les re-renders inutiles
  const stableParams = useMemo(() => {
    const { churchId, ...otherParams } = params;
    return {
      churchId: churchId || null,
      ...otherParams
    };
  }, [params.churchId, JSON.stringify(params)]);

  // Fonction pour récupérer les réseaux
  const fetchNetworks = useCallback(async (fetchParams = stableParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier que les paramètres sont valides
      if (!fetchParams || !fetchParams.churchId) {
        setNetworks([]);
        setError(null);
        return;
      }

      // Appel API direct sans cache pour garantir la fraîcheur des données
      const response = await apiService.networks.getAll(fetchParams);
      
      // Traiter la réponse Axios
      if (response.data) {
        const networkData = response.data.data || response.data;
        setNetworks(Array.isArray(networkData) ? networkData : []);
        setError(null);
      } else {
        setError('Aucune donnée reçue du serveur');
        setNetworks([]);
      }
    } catch (err) {
      
      let errorMessage = 'Erreur lors du chargement des réseaux';
      
      // Traiter différents types d'erreurs
      if (err.response) {
        // Erreur HTTP du serveur
        errorMessage = err.response.data?.message || `Erreur ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        // Erreur de réseau
        errorMessage = 'Erreur de connexion au serveur';
      } else {
        // Autre erreur
        errorMessage = err.message || 'Erreur inconnue';
      }
      
      setError(errorMessage);
      setNetworks([]);
    } finally {
      setLoading(false);
    }
  }, [stableParams]);

  // Charger les réseaux au montage et quand les paramètres changent
  useEffect(() => {
    // Vérifier que les paramètres sont valides et contiennent au moins churchId
    if (stableParams && stableParams.churchId) {
      fetchNetworks();
    } else {
      setNetworks([]);
      setError(null);
    }
  }, [stableParams, fetchNetworks]);

  // Fonction de création avec rechargement immédiat
  const createNetwork = useCallback(async (networkData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.networks.create(networkData);
      
      // Recharger immédiatement la liste pour refléter les changements
      await fetchNetworks();
      
      return response;
    } catch (err) {
      const processedError = handleApiError(err, 'la création du réseau');
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [fetchNetworks]);

  // Fonction de mise à jour avec rechargement immédiat
  const updateNetwork = useCallback(async (id, networkData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.networks.update(id, networkData);
      
      // Recharger immédiatement la liste pour refléter les changements
      await fetchNetworks();
      
      return response;
    } catch (err) {
      const processedError = handleApiError(err, 'la mise à jour du réseau');
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [fetchNetworks]);

  // Fonction de suppression avec rechargement immédiat
  const deleteNetwork = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.networks.delete(id);
      
      // Recharger immédiatement la liste pour refléter les changements
      await fetchNetworks();
      
      return response;
    } catch (err) {
      const processedError = handleApiError(err, 'la suppression du réseau');
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [fetchNetworks]);

  return {
    networks,
    loading,
    error,
    fetchNetworks,
    createNetwork,
    updateNetwork,
    deleteNetwork
  };
};

// Hook pour les églises
export const useChurches = () => {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChurches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.churches.getAll();
      setChurches(response.data?.data || response.data || []);
      return response;
    } catch (err) {
      // Ne pas définir d'erreur globale - l'erreur sera gérée localement
      const processedError = handleApiError(err, 'Erreur lors du chargement des églises');
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les églises au montage initial
  useEffect(() => {
    fetchChurches();
  }, [fetchChurches]);

  return {
    churches,
    loading,
    error,
    fetchChurches
  };
};

// Hook pour les services
export const useServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServices = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.services.getAll(params);
      setServices(response.data?.data || response.data || []);
      return response;
    } catch (err) {
      // Ne pas définir d'erreur globale - l'erreur sera gérée localement
      const processedError = handleApiError(err, 'Erreur lors du chargement des services');
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(async (serviceData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.services.create(serviceData);
      await fetchServices(); // Recharger la liste
      return response;
    } catch (err) {
      // Ne pas définir d'erreur globale - l'erreur sera gérée localement
      const processedError = handleApiError(err, 'Erreur lors de la création');
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [fetchServices]);

  const updateService = useCallback(async (id, serviceData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.services.update(id, serviceData);
      await fetchServices(); // Recharger la liste
      return response;
    } catch (err) {
      // Ne pas définir d'erreur globale - l'erreur sera gérée localement
      const processedError = handleApiError(err, 'Erreur lors de la mise à jour');
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [fetchServices]);

  const deleteService = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.services.delete(id);
      await fetchServices(); // Recharger la liste
      return response;
    } catch (err) {
      // Ne pas définir d'erreur globale - l'erreur sera gérée localement
      const processedError = handleApiError(err, 'Erreur lors de la suppression');
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService
  };
};

// Hook pour les opérations CRUD
export const useCrud = (apiService) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.create(data);
      return response;
    } catch (err) {
      // Ne pas définir d'erreur globale - l'erreur sera gérée localement
      const processedError = handleApiError(err, 'Erreur lors de la création');
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  const update = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.update(id, data);
      return response;
    } catch (err) {
      // Ne pas définir d'erreur globale - l'erreur sera gérée localement
      const processedError = handleApiError(err, 'Erreur lors de la mise à jour');
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.delete(id);
      return response;
    } catch (err) {
      // Ne pas définir d'erreur globale - l'erreur sera gérée localement
      const processedError = handleApiError(err, 'Erreur lors de la suppression');
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  return {
    loading,
    error,
    create,
    update,
    remove
  };
};

// Hook spécialisé pour les listes avec pagination
export const useApiList = (apiMethod, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const fetchData = useCallback(async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const updatedParams = { ...params, ...newParams };
      setParams(updatedParams);
      
      const response = await apiMethod(updatedParams);
      setData(response.data);
      
      if (response.pagination) {
        setPagination(response.pagination);
      }
      
      return response;
    } catch (err) {
      // Ne pas définir d'erreur globale - l'erreur sera gérée localement
      const processedError = handleApiError(err, 'Une erreur est survenue');
      const secureError = new Error(processedError.message);
      secureError.userMessage = processedError.message;
      throw secureError;
    } finally {
      setLoading(false);
    }
  }, [apiMethod, params]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    params,
    fetchData,
    refetch,
    updateParams
  };
}; 