import { useState, useEffect, useCallback } from 'react';
import { handleApiError } from '../utils/errorHandler';
import { usePerformanceMonitor } from './usePerformanceMonitor';

// Cache global pour éviter les rechargements
const globalCache = new Map();
const cacheTimestamps = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes pour plus de fraîcheur

export const useGlobalCache = (key, fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Monitoring des performances
  const performanceMonitor = usePerformanceMonitor(`useGlobalCache-${key}`);

  const isCacheValid = useCallback(() => {
    const timestamp = cacheTimestamps.get(key);
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_DURATION;
  }, [key]);

  const getCachedData = useCallback(() => {
    const cachedData = globalCache.get(key);
    if (cachedData) {
      performanceMonitor.trackCacheHit();
    } else {
      performanceMonitor.trackCacheMiss();
    }
    return cachedData;
  }, [key, performanceMonitor]);

  const setCachedData = useCallback((newData) => {
    globalCache.set(key, newData);
    cacheTimestamps.set(key, Date.now());
  }, [key]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Vérifier le cache si pas de force refresh
    if (!forceRefresh && isCacheValid()) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const result = await fetchFunction();
      const duration = performance.now() - startTime;
      
      // Tracker les performances de l'API
      performanceMonitor.trackApiCall(key, duration, true);
      
      setCachedData(result);
      setData(result);
      return result;
    } catch (err) {
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall(key, duration, false);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, isCacheValid, getCachedData, setCachedData, key, performanceMonitor]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    globalCache.delete(key);
    cacheTimestamps.delete(key);
  }, [key]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache
  };
};

// Fonction utilitaire pour vider tout le cache
export const clearAllCache = () => {
  globalCache.clear();
  cacheTimestamps.clear();
};

// Fonction utilitaire pour obtenir les statistiques du cache
export const getCacheStats = () => {
  return {
    size: globalCache.size,
    keys: Array.from(globalCache.keys()),
    timestamps: Object.fromEntries(cacheTimestamps)
  };
};