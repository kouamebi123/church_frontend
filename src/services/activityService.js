import authAxios from './authService';

const activityService = {
  // Récupérer l'historique des activités
  getHistory: async (params = {}) => {
    try {
      const response = await authAxios.get('/activities/history', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  },

  // Récupérer les statistiques des activités
  getStats: async (params = {}) => {
    try {
      const response = await authAxios.get('/activities/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Enregistrer une activité
  logActivity: async (activityData) => {
    try {
      const response = await authAxios.post('/activities/log', activityData, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      // Ne pas logger l'erreur pour éviter le spam dans la console
      // L'activité n'est pas critique pour le fonctionnement de l'app
      return null;
    }
  }
};

export default activityService;
