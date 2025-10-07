import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, MenuItem, Menu, IconButton, Avatar, CircularProgress, ListItemIcon, ListItemText, Divider, Snackbar, Alert } from '@mui/material';
import {
  Logout,
  Dashboard as DashboardIcon,
  AccountCircle,
  SwapHoriz,
  Check
} from '@mui/icons-material';
import { logout } from '@features/auth/authSlice';
import i18nService from '@services/i18nService';
import { useUserSync } from '@hooks/useUserSync';
import { usePermissions } from '@hooks/usePermissions';
import { useRoleUpdate } from '@hooks/useRoleUpdate';
import { formatRole } from '@utils/roleFormatter';
import roleService from '@services/roleService';

const UserMenu = ({ 
  anchorEl, 
  onMenuOpen, 
  onMenuClose,
  sx = {} 
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [roleMenuAnchor, setRoleMenuAnchor] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Utiliser le hook personnalisé pour la synchronisation de l'utilisateur
  const { user, getUserImageUrl, isImageLoading, syncUser } = useUserSync();
  const permissions = usePermissions();
  const { updateUserData, isUpdating } = useRoleUpdate();

  // Charger les rôles disponibles au montage du composant
  React.useEffect(() => {
    if (user && (user.available_roles?.length > 1 || user.role_assignments?.length > 1)) {
      loadAvailableRoles();
    }
  }, [user]);

  const handleDashboard = () => {
    onMenuClose();
    navigate('/dashboard');
  };

  const handleProfile = () => {
    onMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    onMenuClose();
    dispatch(logout());
    navigate('/login');
  };

  // Gestion du menu de changement de rôle
  const handleRoleMenuOpen = (event) => {
    event.stopPropagation();
    setRoleMenuAnchor(event.currentTarget);
    loadAvailableRoles();
  };

  const handleRoleMenuClose = () => {
    setRoleMenuAnchor(null);
  };

  // Gestion du snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Fonction pour trier les rôles par hiérarchie (du plus élevé au plus bas)
  const sortRolesByHierarchy = (roles) => {
    const roleHierarchy = {
      'SUPER_ADMIN': 6,
      'ADMIN': 5,
      'MANAGER': 4,
      'SUPERVISEUR': 3,
      'COLLECTEUR_CULTE': 2,
      'COLLECTEUR_RESEAUX': 2,
      'MEMBRE': 1
    };
    
    return roles.sort((a, b) => {
      const levelA = roleHierarchy[a] || 0;
      const levelB = roleHierarchy[b] || 0;
      return levelB - levelA; // Tri décroissant (du plus élevé au plus bas)
    });
  };

  // Charger les rôles disponibles
  const loadAvailableRoles = async () => {
    try {
      // Utiliser les rôles déjà disponibles dans l'utilisateur
      if (user.available_roles && user.available_roles.length > 0) {
        setAvailableRoles(sortRolesByHierarchy([...user.available_roles]));
        return;
      }
      
      // Sinon, charger depuis l'API
      const response = await roleService.getAvailableRoles();
      const roles = response.data.available_roles || [];
      setAvailableRoles(sortRolesByHierarchy([...roles]));
    } catch (error) {
      // Fallback: utiliser les rôles de l'utilisateur
      if (user.available_roles) {
        setAvailableRoles(sortRolesByHierarchy([...user.available_roles]));
      }
    }
  };

  // Changer de rôle
  const handleRoleChange = async (newRole) => {
    try {
      setIsChangingRole(true);
      await roleService.changeRole(newRole);
      
      // Recharger les données utilisateur via le hook de mise à jour
      await updateUserData();
      
      // Fermer les menus
      handleRoleMenuClose();
      onMenuClose();
      
      // Afficher un message de succès
      showSnackbar(`Rôle changé vers ${formatRole(newRole)} avec succès`, 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors du changement de rôle. Veuillez réessayer.';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsChangingRole(false);
    }
  };

  if (!user) {
    return null;
  }


  return (
    <Box sx={sx}>
      <IconButton
        color="inherit"
        onClick={onMenuOpen}
        sx={{ ml: 2 }}
        size="large"
      >
        {isImageLoading() ? (
          <CircularProgress 
            size={44} 
            sx={{ color: 'inherit' }}
          />
        ) : (
          <Avatar 
            src={getUserImageUrl()}
            sx={{ 
              width: 44, 
              height: 44, 
              bgcolor: 'primary.main',
              cursor: 'pointer',
              border: '2px solid white',
              boxShadow: '0 4px 12px rgba(91, 33, 182, 0.25)',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 6px 16px rgba(91, 33, 182, 0.35)',
                transition: 'all 0.3s ease'
              }
            }}
            onError={(e) => {
              // En cas d'erreur, forcer la synchronisation
              syncUser();
            }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || <AccountCircle sx={{ width: 44, height: 44 }} />}
          </Avatar>
        )}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleProfile}>
          <AccountCircle sx={{ mr: 1 }} /> {i18nService.t('navigation.profile')}
        </MenuItem>
        {user && (permissions.isAdmin || permissions.isSuperAdmin || permissions.isManager) && (
          <MenuItem onClick={handleDashboard}>
            <DashboardIcon sx={{ mr: 1 }} /> {i18nService.t('navigation.dashboard')}
          </MenuItem>
        )}
        
        {/* Menu de changement de rôle */}
        {user && (user.available_roles?.length > 1 || user.role_assignments?.length > 1) && (
          <>
            <Divider />
            <MenuItem onClick={handleRoleMenuOpen} disabled={isChangingRole}>
              <SwapHoriz sx={{ mr: 1 }} /> 
              Changer de rôle
              {isChangingRole && <CircularProgress size={16} sx={{ ml: 1 }} />}
            </MenuItem>
          </>
        )}
        
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} /> {i18nService.t('navigation.logout')}
        </MenuItem>
      </Menu>

      {/* Menu de sélection de rôle */}
      <Menu
        anchorEl={roleMenuAnchor}
        open={Boolean(roleMenuAnchor)}
        onClose={handleRoleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {availableRoles.map((role) => (
          <MenuItem 
            key={role} 
            onClick={() => handleRoleChange(role)}
            disabled={isChangingRole || isUpdating}
          >
            <ListItemIcon>
              {(isChangingRole || isUpdating) ? <CircularProgress size={20} /> : (user?.current_role === role && <Check />)}
            </ListItemIcon>
            <ListItemText 
              primary={formatRole(role)}
              secondary={
                (isChangingRole || isUpdating) ? 'Mise à jour en cours...' : 
                (user?.current_role === role ? 'Rôle actuel' : '')
              }
            />
          </MenuItem>
        ))}
      </Menu>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserMenu;
