import authAxios from './authService';
import logger from '@utils/logger';


class MessageService {
  // Envoyer un message
  async sendMessage(messageData) {
    try {
      const response = await authAxios.post('/messages/send', messageData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      // logger.error('❌ MessageService - Erreur envoi:', error);
      throw error;
    }
  }

  // Récupérer les messages reçus
  async getReceivedMessages(params = {}) {
    try {
      const response = await authAxios.get('/messages/received', { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des messages');
      }
    } catch (error) {
      // logger.error('❌ MessageService - Erreur récupération messages reçus:', error);
      throw error;
    }
  }

  // Récupérer les messages envoyés (admins seulement)
  async getSentMessages(params = {}) {
    try {
      const response = await authAxios.get('/messages/sent', { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des messages envoyés');
      }
    } catch (error) {
      // logger.error('❌ MessageService - Erreur récupération messages envoyés:', error);
      throw error;
    }
  }

  // Marquer un message comme lu
  async markAsRead(messageRecipientId) {
    try {
      const response = await authAxios.put(`/messages/${messageRecipientId}/read`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Erreur lors du marquage du message');
      }
    } catch (error) {
      // logger.error('❌ MessageService - Erreur marquage lu:', error);
      throw error;
    }
  }

  // Marquer plusieurs messages comme lus
  async markMultipleAsRead(messageIds) {
    try {
      const response = await authAxios.put('/messages/mark-multiple-read', {
        messageIds
      });
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
          count: response.data.count
        };
      } else {
        throw new Error(response.data.message || 'Erreur lors du marquage des messages');
      }
    } catch (error) {
      // logger.error('❌ MessageService - Erreur marquage multiple comme lu:', error);
      throw error;
    }
  }

  // Accuser réception d'un message
  async acknowledgeMessage(messageRecipientId) {
    try {
      const response = await authAxios.put(`/messages/${messageRecipientId}/acknowledge`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'accusé de réception');
      }
    } catch (error) {
      // logger.error('❌ MessageService - Erreur accusé de réception:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des messages
  async getMessageStats() {
    try {
      const response = await authAxios.get('/messages/stats');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des statistiques');
      }
    } catch (error) {
      // logger.error('❌ MessageService - Erreur statistiques:', error);
      throw error;
    }
  }

  // Récupérer la liste des utilisateurs pour l'envoi de messages (admins seulement)
  async getUsersForMessaging(churchId) {
    try {
      const response = await authAxios.get('/messages/users', {
        params: { churchId }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des utilisateurs');
      }
    } catch (error) {
      // logger.error('❌ MessageService - Erreur utilisateurs:', error);
      throw error;
    }
  }

  // Récupérer les conversations avec le dernier message
  async getConversations(params = {}) {
    try {
      const response = await authAxios.get('/messages/conversations', { params });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des conversations');
      }
    } catch (error) {
      // logger.error('❌ MessageService - Erreur conversations:', error);
      throw error;
    }
  }

  // Récupérer l'historique d'une conversation avec un utilisateur
  async getConversationHistory(userId) {
    try {
      const response = await authAxios.get(`/messages/conversation/${userId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération de la conversation');
      }
    } catch (error) {
      // logger.error('❌ MessageService - Erreur conversation:', error);
      throw error;
    }
  }

  // Récupérer les statuts de lecture d'un message envoyé
  async getMessageReadStatus(messageId) {
    try {
      const response = await authAxios.get(`/messages/${messageId}/read-status`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération du statut de lecture');
      }
    } catch (error) {
      // logger.error('❌ MessageService - Erreur statut de lecture:', error);
      throw error;
    }
  }
}

export default new MessageService();
