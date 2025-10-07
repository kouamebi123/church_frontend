import { useMemo, useCallback } from 'react';
import { formatQualification } from '@utils/qualificationFormatter';

// Hook pour optimiser les calculs de données
export const useOptimizedData = (data, dependencies = []) => {
  const memoizedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.map(item => ({
      ...item,
      // Ajouter des propriétés calculées si nécessaire
      displayName: item.username || item.nom || 'Sans nom',
      isActive: item.status !== 'inactive'
    }));
  }, [data, ...dependencies]);

  return memoizedData;
};

// Hook pour optimiser les filtres
export const useOptimizedFilters = (data, filters) => {
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!filters || Object.keys(filters).length === 0) return data;

    return data.filter(item => {
      // Filtre par texte
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableFields = [
          item.username,
          item.nom,
          item.email,
          item.ville_residence
        ].filter(Boolean);

        if (!searchableFields.some(field =>
          field.toLowerCase().includes(searchLower)
        )) {
          return false;
        }
      }

      // Filtre par rôle
      if (filters.role && item.role !== filters.role) {
        return false;
      }

      // Filtre par qualification
      if (filters.qualification && formatQualification(item.qualification) !== formatQualification(filters.qualification)) {
        return false;
      }

      // Filtre par genre
      if (filters.genre && item.genre !== filters.genre) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  return filteredData;
};

// Hook pour optimiser la pagination
export const useOptimizedPagination = (data, page, rowsPerPage) => {
  const paginatedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return data.slice(startIndex, endIndex);
  }, [data, page, rowsPerPage]);

  const totalPages = useMemo(() => {
    if (!data || !Array.isArray(data)) return 0;
    return Math.ceil(data.length / rowsPerPage);
  }, [data, rowsPerPage]);

  return { paginatedData, totalPages };
};

// Hook pour optimiser les statistiques
export const useOptimizedStats = (data) => {
  const stats = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {
        total: 0,
        byRole: {},
        byQualification: {},
        byGenre: {}
      };
    }

    return {
      total: data.length,
      byRole: data.reduce((acc, item) => {
        acc[item.role] = (acc[item.role] || 0) + 1;
        return acc;
      }, {}),
      byQualification: data.reduce((acc, item) => {
        const formattedQualification = formatQualification(item.qualification) || 'Non définie';
        acc[formattedQualification] = (acc[formattedQualification] || 0) + 1;
        return acc;
      }, {}),
      byGenre: data.reduce((acc, item) => {
        acc[item.genre] = (acc[item.genre] || 0) + 1;
        return acc;
      }, {})
    };
  }, [data]);

  return stats;
};

// Hook pour optimiser les callbacks
export const useOptimizedCallbacks = () => {
  const handleEdit = useCallback((id, data) => {
    // Logique d'édition optimisée
    }, []);

  const handleDelete = useCallback((id) => {
    // Logique de suppression optimisée
    }, []);

  const handleFilter = useCallback((filters) => {
    // Logique de filtrage optimisée
    }, []);

  return {
    handleEdit,
    handleDelete,
    handleFilter
  };
};