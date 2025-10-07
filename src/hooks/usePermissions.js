import { useSelector } from 'react-redux';

export const usePermissions = () => {
  const { user } = useSelector((state) => state.auth);

  // Normalisation des rôles pour accepter les deux formats (backend Prisma et ancien)
  const normalizeRole = (role) => {
    if (!role) return null;
    const roleStr = role.toString().toUpperCase();
    // Mapping des rôles Prisma vers l'ancien format
    const roleMap = {
      'SUPER_ADMIN': 'SUPER_ADMIN',
      'COLLECTEUR_RESEAUX': 'COLLECTEUR_RESEAUX',
      'COLLECTEUR_CULTE': 'COLLECTEUR_CULTE'
    };
    return roleMap[roleStr] || roleStr;
  };

  const normalizedRole = normalizeRole(user?.current_role || user?.role);

  const isAdmin = normalizedRole === 'ADMIN';
  const isSuperAdmin = normalizedRole === 'SUPER_ADMIN';
  const isManager = normalizedRole === 'MANAGER';
  const isCollecteurReseaux = normalizedRole === 'COLLECTEUR_RESEAUX';
  const isCollecteurCulte = normalizedRole === 'COLLECTEUR_CULTE';
  const isSuperviseur = normalizedRole === 'SUPERVISEUR';
  const isGouvernance = normalizedRole === 'GOUVERNANCE';
  const isMembre = normalizedRole === 'MEMBRE';

  // Logique des permissions :
  // - Admin : lecture seule (boutons grisés)
  // - Super-admin : tous les droits (boutons actifs)
  // - Manager : droits complets sur son église uniquement
  // - Autres rôles : droits complets selon leur rôle
  const canRead = true; // Tous les utilisateurs connectés peuvent lire
  const canCreate = (!isAdmin && !isManager) || isSuperAdmin; // Admin et Manager grisés, Super-admin activé
  const canUpdate = (!isAdmin && !isManager) || isSuperAdmin; // Admin et Manager grisés, Super-admin activé
  const canDelete = (!isAdmin && !isManager) || isSuperAdmin; // Admin et Manager grisés, Super-admin activé

  // Permissions spécifiques pour le manager
  const canManagerCreate = isManager; // Manager peut créer dans son église
  const canManagerUpdate = isManager; // Manager peut modifier dans son église
  const canManagerDelete = isManager; // Manager peut supprimer dans son église
  const canManagerAccessDashboard = isManager; // Manager a accès au dashboard
  const canManagerManageUsers = isManager; // Manager peut gérer les utilisateurs de son église
  const canManagerManageNetworks = isManager; // Manager peut gérer les réseaux de son église
  const canManagerManageGroups = isManager; // Manager peut gérer les groupes de son église
  const canManagerManageServices = isManager; // Manager peut gérer les services de son église
  const canManagerAccessConfig = false; // Manager n'a pas accès à la configuration

  // Permissions spécifiques par rôle
  const permissions = {
    // Lecture
    canReadUsers: canRead,
    canReadNetworks: canRead,
    canReadGroups: canRead,
    canReadServices: canRead,
    canReadChurches: canRead,
    canReadStats: canRead,
    canReadDepartments: canRead,
    canReadCarousel: canRead,
    
    // Création
    canCreateUsers: isSuperAdmin || isManager || isCollecteurReseaux,
    canCreateNetworks: isSuperAdmin || isManager,
    canCreateGroups: isSuperAdmin || isManager || isCollecteurReseaux,
    canCreateServices: isSuperAdmin || isManager || isCollecteurCulte,
    canCreateChurches: isSuperAdmin,
    canCreateDepartments: isSuperAdmin,
    canCreateCarousel: isSuperAdmin,
    
    // Modification
    canUpdateUsers: isSuperAdmin || isManager || isCollecteurReseaux,
    canUpdateNetworks: isSuperAdmin || isManager,
    canUpdateGroups: isSuperAdmin || isManager || isCollecteurReseaux,
    canUpdateServices: isSuperAdmin || isManager || isCollecteurCulte,
    canUpdateChurches: isSuperAdmin,
    canUpdateDepartments: isSuperAdmin,
    
    // Suppression
    canDeleteUsers: isSuperAdmin || isManager || isCollecteurReseaux,
    canDeleteNetworks: isSuperAdmin || isManager,
    canDeleteGroups: isSuperAdmin || isManager || isCollecteurReseaux,
    canDeleteServices: isSuperAdmin || isManager,
    canDeleteChurches: isSuperAdmin,
    canDeleteDepartments: isSuperAdmin,
    canDeleteCarousel: isSuperAdmin,
    
    // Accès au dashboard
    canAccessDashboard: isSuperAdmin || isAdmin || isManager,
    canWriteDashboard: isSuperAdmin || isManager,
    
    // Accès à la configuration
    canAccessConfig: isSuperAdmin,
    
    // Gestion des rôles
    canAssignAdminRole: isSuperAdmin,
    canAssignManagerRole: isSuperAdmin,
    canAssignSuperAdminRole: isSuperAdmin,
    
    // Restrictions spécifiques au manager
    canManagerModifyChurch: false, // Le manager ne peut pas modifier le champ église
    canManagerAccessAllChurches: false, // Le manager n'a accès qu'à son église
    canModifyChurchField: isSuperAdmin || isAdmin, // Seuls Super Admin et Admin peuvent modifier le champ église
  };

  return {
    // Rôles
    isAdmin,
    isSuperAdmin,
    isManager,
    isCollecteurReseaux,
    isCollecteurCulte,
    isSuperviseur,
    isGouvernance,
    isMembre,
    
    // Permissions générales
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    
    // Permissions du manager
    canManagerCreate,
    canManagerUpdate,
    canManagerDelete,
    canManagerAccessDashboard,
    canManagerManageUsers,
    canManagerManageNetworks,
    canManagerManageGroups,
    canManagerManageServices,
    canManagerAccessConfig,
    
    // Permissions détaillées
    ...permissions,
    
    // Permissions spécifiques pour compatibilité
    canCreateDepartments: permissions.canCreateDepartments,
    canUpdateDepartments: permissions.canUpdateDepartments,
    canDeleteDepartments: permissions.canDeleteDepartments,
    canCreateCarousel: permissions.canCreateCarousel,
    canDeleteCarousel: permissions.canDeleteCarousel
  };
};

export default usePermissions;
