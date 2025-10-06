import i18nService from '../services/i18nService';

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

export default formatRole;
