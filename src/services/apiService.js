import authAxios from './authService';

// Service API centralisé pour toutes les requêtes
export const apiService = {
  // Gestion des utilisateurs
  users: {
    getAll: (params) => authAxios.get('/users', { params }),
    getById: (id) => authAxios.get(`/users/${id}`),
    create: (userData) => authAxios.post('/users', userData),
    update: (id, userData) => authAxios.put(`/users/${id}`, userData),
    updateProfile: (userData) => authAxios.put('/users/profile', userData), // Route spécifique pour le profil
    delete: (id) => authAxios.delete(`/users/${id}`),
    updateQualification: (id, qualification) => 
      authAxios.put(`/users/${id}/qualification`, { qualification }),
    resetPassword: (id) => {
      // Générer un mot de passe temporaire robuste (10 caractères alphanumériques)
      const tempPassword = Array.from({length: 10}, () => Math.random().toString(36)[2]).join('');
      return authAxios.post(`/users/${id}/reset-password`, { newPassword: tempPassword })
        .then(response => {
          // Ajouter le mot de passe temporaire à la réponse
          response.data.tempPassword = tempPassword;
          return response;
        });
    },
    getStats: (params) => authAxios.get('/users/stats', { params }),
    getAvailable: (params) => authAxios.get('/users/available', { params }),
    getGovernance: () => authAxios.get('/users/governance'),
    getRetired: (params) => authAxios.get('/users/retired', { params }),
    getNonIsoles: (params) => authAxios.get('/users/non-isoles', { params }),
    getIsoles: (params) => authAxios.get('/users/isoles', { params }),
    getNetwork: (id) => authAxios.get(`/users/${id}/network`),
    uploadProfileImage: (formData) => authAxios.post('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    uploadUserImage: (id, formData) => authAxios.post(`/users/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    removeProfileImage: () => authAxios.delete('/users/profile/image')
  },

  // Gestion des réseaux
  networks: {
    getAll: (params) => authAxios.get('/networks', { params }),
    getById: (id) => authAxios.get(`/networks/${id}`),
    create: (networkData) => authAxios.post('/networks', networkData),
    update: (id, networkData) => authAxios.put(`/networks/${id}`, networkData),
    delete: (id) => authAxios.delete(`/networks/${id}`),
    addMember: (id, memberId) => authAxios.post(`/networks/${id}/members`, { memberId }),
    removeMember: (id, memberId) => authAxios.delete(`/networks/${id}/members/${memberId}`),
    getStats: (params) => authAxios.get('/networks/stats', { params }),
    getStatsById: (id) => authAxios.get(`/networks/${id}/stats`),
    getGroups: (id) => authAxios.get(`/networks/${id}/grs`),
    getMembers: (id) => authAxios.get(`/networks/${id}/members`),
    getQualificationStats: (params) => authAxios.get('/networks/qualification-stats', { params })
  },

  // Gestion des groupes
  groups: {
    getAll: (params) => authAxios.get('/groups', { params }),
    getById: (id) => authAxios.get(`/groups/${id}`),
    create: (groupData) => authAxios.post('/groups', groupData),
    update: (id, groupData) => authAxios.put(`/groups/${id}`, groupData),
    delete: (id) => authAxios.delete(`/groups/${id}`),
    addMember: (id, memberId) => authAxios.post(`/groups/${id}/members`, { user_id: memberId }),
    removeMember: (id, memberId) => authAxios.delete(`/groups/${id}/members/${memberId}`)
  },

  // Gestion des églises
  churches: {
    getAll: () => authAxios.get('/churches'),
    getById: (id) => authAxios.get(`/churches/${id}`),
    create: (churchData) => authAxios.post('/churches', churchData,{
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    update: (id, churchData) => authAxios.patch(`/churches/${id}`, churchData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    delete: (id) => authAxios.delete(`/churches/${id}`),
    getCityInfo: (cityName) => authAxios.get(`/churches/city-info/${encodeURIComponent(cityName)}`)
  },

  // Gestion des départements
  departments: {
    getAll: () => authAxios.get('/departments'),
    getById: (id) => authAxios.get(`/departments/${id}`),
    create: (departmentData) => authAxios.post('/departments', departmentData),
    update: (id, departmentData) => authAxios.put(`/departments/${id}`, departmentData),
    delete: (id) => authAxios.delete(`/departments/${id}`)
  },

  // Gestion des services/cultes
  services: {
    getAll: (params) => authAxios.get('/services', { params }),
    getById: (id) => authAxios.get(`/services/${id}`),
    create: (serviceData) => authAxios.post('/services', serviceData),
    update: (id, serviceData) => authAxios.put(`/services/${id}`, serviceData),
    delete: (id) => authAxios.delete(`/services/${id}`),
    getStats: (params) => authAxios.get('/services/stats', { params })
  },

  // Gestion du carousel
  carousel: {
    getAll: () => authAxios.get('/carousel'),
    upload: (formData) => authAxios.post('/carousel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    delete: (id) => authAxios.delete(`/carousel/${id}`)
  },

  // Gestion des témoignages
  testimonies: {
    getAll: (params) => authAxios.get('/testimonies/admin/all', { params }),
    getById: (id) => authAxios.get(`/testimonies/${id}`),
    delete: (id) => authAxios.delete(`/testimonies/${id}`),
    getCategories: () => authAxios.get('/testimonies/categories'),
    markAsRead: (id) => authAxios.put(`/testimonies/${id}/mark-read`),
    addNote: (id, note) => authAxios.put(`/testimonies/${id}/note`, { note }),
    // Nouvelles fonctions pour la gestion des témoignages de culte
    getForCulte: (params) => authAxios.get(`/testimonies/admin/culte/${params.churchId}`, { params }),
    confirmForCulte: (id, data) => authAxios.put(`/testimonies/${id}/confirm-culte`, data),
    markAsTestified: (id) => authAxios.put(`/testimonies/${id}/mark-testified`)
  },

  // Statistiques générales
  stats: {
    getOverview: (params) => authAxios.get('/stats', { params }),
    getNetworks: (params) => authAxios.get('/networks/stats', { params }),
    getMembers: (params) => authAxios.get('/users/stats', { params }),
    getServices: (params) => authAxios.get('/services/stats', { params }),
    getNetworksEvolution: (params) => authAxios.get('/stats/networks/evolution', { params }),
    getNetworksComparison: (params) => {
      // Extraire years des params et les séparer en year1 et year2
      const { years, ...otherParams } = params;
      let queryParams = { ...otherParams };
      
      if (years) {
        const [year1, year2] = years.split(',');
        queryParams.year1 = year1;
        queryParams.year2 = year2;
      }
      
      return authAxios.get('/stats/networks/evolution/compare', { params: queryParams });
    }
  }
};

export default apiService; 