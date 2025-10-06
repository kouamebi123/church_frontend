/**
 * Formate une qualification pour l'affichage
 * @param {string} qualification - La qualification à formater
 * @returns {string} - La qualification formatée
 */
export const formatQualification = (qualification) => {
  if (!qualification) return '';
  
  // Supprimer le préfixe "QUALIFICATION_" s'il existe
  if (qualification.startsWith('QUALIFICATION_')) {
    return qualification.replace('QUALIFICATION_', '');
  }
  
  return qualification;
};

/**
 * Formate une qualification pour l'affichage avec fallback
 * @param {string} qualification - La qualification à formater
 * @param {string} fallback - Valeur par défaut si pas de qualification
 * @returns {string} - La qualification formatée ou le fallback
 */
export const formatQualificationWithFallback = (qualification, fallback = 'Non définie') => {
  if (!qualification) return fallback;
  
  const formatted = formatQualification(qualification);
  return formatted || fallback;
};
