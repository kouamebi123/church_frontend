import authAxios from './authService';

class PrevisionnelService {
  // Créer un nouveau prévisionnel
  async create(previsionnelData) {
    try {
      const response = await authAxios.post('/previsionnels', previsionnelData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les prévisionnels d'un réseau
  async getByNetwork(networkId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.type_culte) params.append('type_culte', filters.type_culte);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await authAxios.get(`/previsionnels/network/${networkId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer un prévisionnel par ID
  async getById(id) {
    try {
      const response = await authAxios.get(`/previsionnels/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un prévisionnel
  async update(id, previsionnelData) {
    try {
      const response = await authAxios.put(`/previsionnels/${id}`, previsionnelData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer un prévisionnel
  async delete(id) {
    try {
      const response = await authAxios.delete(`/previsionnels/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les statistiques de prévisionnels
  async getStats(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.church_id) params.append('church_id', filters.church_id);
      if (filters.network_id) params.append('network_id', filters.network_id);
      if (filters.type_culte) params.append('type_culte', filters.type_culte);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const url = `/previsionnels/stats?${params.toString()}`;
      
      const response = await authAxios.get(url);
      return response.data;
    } catch (error) {
      //console.error('❌ PrevisionnelService - Erreur dans getStats:', error);
      /* console.error('❌ PrevisionnelService - Détails de l\'erreur:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      }); */
      throw error;
    }
  }
}

const previsionnelService = new PrevisionnelService();
export default previsionnelService;
