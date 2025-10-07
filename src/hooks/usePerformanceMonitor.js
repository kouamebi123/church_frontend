import { useEffect, useCallback, useRef } from 'react';

// Métriques de performance
const performanceMetrics = {
  pageLoads: 0,
  apiCalls: 0,
  cacheHits: 0,
  cacheMisses: 0,
  renderTimes: [],
  memoryUsage: []
};

export const usePerformanceMonitor = (componentName) => {
  const renderStartTime = useRef(performance.now());
  const apiCallCount = useRef(0);

  // Mesurer le temps de rendu
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    performanceMetrics.renderTimes.push({
      component: componentName,
      time: renderTime,
      timestamp: Date.now()
    });

    // Garder seulement les 100 derniers rendus
    if (performanceMetrics.renderTimes.length > 100) {
      performanceMetrics.renderTimes.shift();
    }

    performanceMetrics.pageLoads++;
  });

  // Monitorer les appels API
  const trackApiCall = useCallback((endpoint, duration, success) => {
    apiCallCount.current++;
    performanceMetrics.apiCalls++;
    
    // Envoyer les métriques au backend si configuré
    if (import.meta.env.VITE_PERFORMANCE_TRACKING === 'true') {
      // Envoyer les métriques au backend
      fetch('/api/performance/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component: componentName,
          endpoint,
          duration,
          success,
          timestamp: Date.now()
        })
      }).catch(() => {
        // Ignorer les erreurs de tracking
      });
    }
  }, [componentName]);

  // Monitorer l'utilisation mémoire
  useEffect(() => {
    if ('memory' in performance) {
      const memoryInfo = performance.memory;
      performanceMetrics.memoryUsage.push({
        component: componentName,
        used: memoryInfo.usedJSHeapSize,
        total: memoryInfo.totalJSHeapSize,
        limit: memoryInfo.jsHeapSizeLimit,
        timestamp: Date.now()
      });

      // Garder seulement les 50 dernières mesures
      if (performanceMetrics.memoryUsage.length > 50) {
        performanceMetrics.memoryUsage.shift();
      }
    }
  }, [componentName]);

  // Obtenir les statistiques de performance
  const getPerformanceStats = useCallback(() => {
    const avgRenderTime = performanceMetrics.renderTimes.length > 0
      ? performanceMetrics.renderTimes.reduce((sum, item) => sum + item.time, 0) / performanceMetrics.renderTimes.length
      : 0;

    const avgMemoryUsage = performanceMetrics.memoryUsage.length > 0
      ? performanceMetrics.memoryUsage.reduce((sum, item) => sum + item.used, 0) / performanceMetrics.memoryUsage.length
      : 0;

    return {
      component: componentName,
      pageLoads: performanceMetrics.pageLoads,
      apiCalls: performanceMetrics.apiCalls,
      cacheHits: performanceMetrics.cacheHits,
      cacheMisses: performanceMetrics.cacheMisses,
      avgRenderTime: avgRenderTime.toFixed(2),
      avgMemoryUsage: (avgMemoryUsage / 1024 / 1024).toFixed(2) + ' MB',
      timestamp: Date.now()
    };
  }, [componentName]);

  // Marquer un hit de cache
  const trackCacheHit = useCallback(() => {
    performanceMetrics.cacheHits++;
  }, []);

  // Marquer un miss de cache
  const trackCacheMiss = useCallback(() => {
    performanceMetrics.cacheMisses++;
  }, []);

  return {
    trackApiCall,
    trackCacheHit,
    trackCacheMiss,
    getPerformanceStats,
    apiCallCount: apiCallCount.current
  };
};

// Fonction utilitaire pour obtenir toutes les métriques
export const getAllPerformanceMetrics = () => {
  return {
    ...performanceMetrics,
    cacheHitRate: performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses) * 100 || 0,
    avgRenderTime: performanceMetrics.renderTimes.length > 0
      ? performanceMetrics.renderTimes.reduce((sum, item) => sum + item.time, 0) / performanceMetrics.renderTimes.length
      : 0
  };
};

// Fonction utilitaire pour réinitialiser les métriques
export const resetPerformanceMetrics = () => {
  performanceMetrics.pageLoads = 0;
  performanceMetrics.apiCalls = 0;
  performanceMetrics.cacheHits = 0;
  performanceMetrics.cacheMisses = 0;
  performanceMetrics.renderTimes = [];
  performanceMetrics.memoryUsage = [];
};
