import { useState, useEffect } from 'react';
import { handleApiError } from '@utils/errorHandler';
import { apiService } from '@services/apiService';

export const useInitialData = () => {
  const [churches, setChurches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les églises
        const churchesResponse = await apiService.churches.getAll();
        if (churchesResponse && churchesResponse.data && churchesResponse.data.success && Array.isArray(churchesResponse.data.data)) {
          setChurches(churchesResponse.data.data);
        } else {
          setChurches([]);
        }
        
        // Récupérer les départements
        const departmentsResponse = await apiService.departments.getAll();
        
        // Vérifier que la réponse est valide
        if (departmentsResponse && departmentsResponse.data && departmentsResponse.data.success && Array.isArray(departmentsResponse.data.data)) {
          setDepartments(departmentsResponse.data.data);
        } else {
          setDepartments([]);
        }
        
      } catch (err) {
        const processedError = handleApiError(err, 'erreur lors du chargement des données initiales:');
            ;
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { churches, departments, loading, error };
};
