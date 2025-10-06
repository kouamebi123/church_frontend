import authAxios from './authService';
import { API_URL } from '../config/apiConfig';

export const chaineImpactService = {
  // Récupérer la chaîne d'impact d'une église sous forme d'arbre hiérarchique
  getChaineImpact: async (churchId) => {
    try {
      const response = await authAxios.get(`/chaine-impact?church_id=${churchId}`);
      return response.data; // Retourne maintenant { success, church_id, total_nodes, tree }
    } catch (error) {
      // console.error('Erreur lors de la récupération de la chaîne d\'impact:', error);
      throw error;
    }
  },

  // Récupérer la chaîne d'impact d'un utilisateur spécifique
  getChaineImpactByUser: async (userId) => {
    try {
      const response = await authAxios.get(`/chaine-impact/user/${userId}`);
      return response.data;
    } catch (error) {
      // console.error('Erreur lors de la récupération de la chaîne d\'impact de l\'utilisateur:', error);
      throw error;
    }
  },

  // Mettre à jour/rebâtir automatiquement la chaîne d'impact
  updateChaineImpact: async (churchId) => {
    try {
      const response = await authAxios.post('/chaine-impact/update', { church_id: churchId });
      return response.data;
    } catch (error) {
      // console.error('Erreur lors de la mise à jour de la chaîne d\'impact:', error);
      throw error;
    }
  },

  // Supprimer la chaîne d'impact d'une église
  deleteChaineImpact: async (churchId) => {
    try {
      const response = await authAxios.delete(`/chaine-impact/${churchId}`);
      return response.data;
    } catch (error) {
      // console.error('Erreur lors de la suppression de la chaîne d\'impact:', error);
      throw error;
    }
  }
};

export default chaineImpactService;
