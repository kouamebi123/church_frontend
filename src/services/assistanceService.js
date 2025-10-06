import authAxios from './authService';

class AssistanceService {
  // Créer une nouvelle assistance
  async create(assistanceData) {
    try {
      const response = await authAxios.post('/assistance', assistanceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les statistiques d'assistance
  async getStats(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await authAxios.get(`/assistance/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir une assistance par ID
  async getById(id) {
    try {
      const response = await authAxios.get(`/assistance/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour une assistance
  async update(id, assistanceData) {
    try {
      const response = await authAxios.put(`/assistance/${id}`, assistanceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer une assistance
  async delete(id) {
    try {
      const response = await authAxios.delete(`/assistance/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AssistanceService();
