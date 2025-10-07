import i18nService from '@services/i18nService';

/**
 * Formate un rôle pour l'affichage en utilisant le service i18n
 * @param {string} role - Le rôle à formater
 * @returns {string} - Le rôle formaté ou le rôle original si non trouvé
 */
export const formatRole = (role) => {
  if (!role) return '-';
  
  const formattedRole = i18nService.t(`common.roles.${role}`);
  
  // Si la traduction n'existe pas, retourner le rôle original
  if (formattedRole === `common.roles.${role}`) {
    return role;
  }
  
  return formattedRole;
};

/**
 * Formate un rôle avec fallback
 * @param {string} role - Le rôle à formater
 * @param {string} fallback - Valeur de fallback si le rôle est vide
 * @returns {string} - Le rôle formaté ou le fallback
 */
export const formatRoleWithFallback = (role, fallback = '-') => {
  if (!role) return fallback;
  return formatRole(role);
};

/**
 * Obtient le nom d'affichage d'un rôle
 * @param {string} role - Le rôle
 * @returns {string} - Le nom d'affichage
 */
export const getRoleDisplayName = (role) => {
  if (!role) return 'Non défini';
  
  const roleMap = {
    'SUPER_ADMIN': 'Super Administrateur',
    'ADMIN': 'Administrateur',
    'MANAGER': 'Gestionnaire',
    'SUPERVISEUR': 'Superviseur',
    'COLLECTEUR_RESEAUX': 'Collecteur Réseaux',
    'COLLECTEUR_CULTE': 'Collecteur Culte',
    'MEMBRE': 'Membre'
  };
  
  return roleMap[role] || role;
};

/**
 * Obtient la couleur Material-UI d'un rôle
 * @param {string} role - Le rôle
 * @returns {string} - La couleur
 */
export const getRoleColor = (role) => {
  const colorMap = {
    'SUPER_ADMIN': 'error',
    'ADMIN': 'warning',
    'MANAGER': 'info',
    'SUPERVISEUR': 'secondary',
    'COLLECTEUR_RESEAUX': 'primary',
    'COLLECTEUR_CULTE': 'success',
    'MEMBRE': 'default'
  };
  
  return colorMap[role] || 'default';
};

/**
 * Obtient l'icône Material-UI d'un rôle
 * @param {string} role - Le rôle
 * @returns {string} - Le nom de l'icône
 */
export const getRoleIcon = (role) => {
  const iconMap = {
    'SUPER_ADMIN': 'AdminPanelSettingsIcon',
    'ADMIN': 'AdminPanelSettingsIcon',
    'MANAGER': 'ManageAccountsIcon',
    'SUPERVISEUR': 'SupervisorAccountIcon',
    'COLLECTEUR_RESEAUX': 'NetworkCheckIcon',
    'COLLECTEUR_CULTE': 'ChurchIcon',
    'MEMBRE': 'PersonIcon'
  };
  
  return iconMap[role] || 'PersonIcon';
};

export default formatRole;
