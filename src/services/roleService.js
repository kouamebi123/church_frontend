import authAxios from './authService';

const roleService = {
  // Changer le rôle actuel de l'utilisateur
  changeRole: async (role) => {
    try {
      const response = await authAxios.post('/roles/change-role', { role });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtenir les rôles disponibles de l'utilisateur
  getAvailableRoles: async () => {
    try {
      const response = await authAxios.get('/roles/available-roles');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Assigner un rôle à un utilisateur (pour les admins)
  assignRole: async (userId, role) => {
    try {
      const response = await authAxios.post('/roles/assign', { userId, role });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Retirer un rôle d'un utilisateur (pour les admins)
  removeRole: async (userId, role) => {
    try {
      const response = await authAxios.delete('/roles/remove', { 
        data: { userId, role } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Assigner plusieurs rôles à un utilisateur (pour les admins)
  assignMultipleRoles: async (userId, roles) => {
    try {
      const response = await authAxios.post('/roles/assign-multiple', { 
        userId, 
        roles 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtenir les rôles d'un utilisateur spécifique (pour les admins)
  getUserRoles: async (userId) => {
    try {
      const response = await authAxios.get(`/roles/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default roleService;
