import authAxios from './authService';
import logger from '@utils/logger';


/**
 * Service pour la gestion des préférences utilisateur via l'API
 */
class PreferencesApiService {
  /**
   * Récupère les préférences de l'utilisateur connecté
   */
  async getPreferences() {
    try {
      const response = await authAxios.get('/preferences');
      return response.data;
    } catch (error) {
      logger.error('Erreur lors de la récupération des préférences:', error);
      throw error;
    }
  }

  /**
   * Met à jour toutes les préférences
   */
  async updatePreferences(preferences) {
    try {
      const response = await authAxios.put('/preferences', preferences);
      return response.data;
    } catch (error) {
      logger.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }

  /**
   * Met à jour uniquement les préférences email
   */
  async updateEmailPreferences(email_notifications) {
    try {
      const response = await authAxios.put('/preferences/email', { email_notifications });
      return response.data;
    } catch (error) {
      logger.error('Erreur lors de la mise à jour des préférences email:', error);
      throw error;
    }
  }
}

export default new PreferencesApiService();

