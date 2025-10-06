import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, Typography, Button, Paper, MenuItem, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Badge } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {
  ArrowDropDown,
  Groups,
  EventAvailable,
  DashboardCustomize,
  EventNote,
  Logout,
  AccountCircle,
  Message as MessageIcon
} from '@mui/icons-material';
import { logout } from '../features/auth/authSlice';
import i18nService from '../services/i18nService';
import { useLanguageThemeSync } from '../hooks/useLanguageThemeSync';
import { useUserSync } from '../hooks/useUserSync';
import { usePermissions } from '../hooks/usePermissions';
import MessageModal from './MessageModal';
import messageService from '../services/messageService';
import socketService from '../services/socketService';
import { useRealtimeMessaging } from '../hooks/useRealtimeMessaging';
import UserMenu from './sections/UserMenu';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Utiliser le hook de synchronisation
  const lastUpdate = useLanguageThemeSync();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Utiliser le hook personnalisé pour la synchronisation de l'utilisateur
  const { user, isUserFullyLoaded, getUserImageUrl, isImageLoading, syncUser } = useUserSync();
  const permissions = usePermissions();

  // Messagerie - état local pour les statistiques
  const [messageStats, setMessageStats] = React.useState({ unread_count: 0 });
  const [messageStatsLoading, setMessageStatsLoading] = React.useState(false);

  // Menu utilisateur
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Mobile drawer
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Messagerie
  const [messageModalOpen, setMessageModalOpen] = React.useState(false);

  // Charger les statistiques de messagerie
  const loadMessageStats = async () => {
    if (!user) return;
    
    setMessageStatsLoading(true);
    try {
      const response = await messageService.getMessageStats();
      setMessageStats(response.data || { unread_count: 0 });
    } catch (error) {
      
    } finally {
      setMessageStatsLoading(false);
    }
  };

  // Charger les statistiques de messagerie au montage et périodiquement
  React.useEffect(() => {
    if (user) {
      loadMessageStats();
      // Recharger toutes les 30 secondes
      const interval = setInterval(loadMessageStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Écouter les événements Socket.IO pour mettre à jour les statistiques en temps réel
  React.useEffect(() => {
    if (!user) return;

    const handleNewMessage = () => {
      // Recharger les statistiques quand un nouveau message arrive
      loadMessageStats();
    };

    const handleMessageRead = () => {
      // Recharger les statistiques quand un message est lu
      loadMessageStats();
    };

    // Écouter les événements Socket.IO
    socketService.addListener('new_message', handleNewMessage);
    socketService.addListener('message_read', handleMessageRead);
    socketService.addListener('message_stats_updated', handleNewMessage);

    return () => {
      // Nettoyer les listeners
      socketService.removeListener('new_message', handleNewMessage);
      socketService.removeListener('message_read', handleMessageRead);
      socketService.removeListener('message_stats_updated', handleNewMessage);
    };
  }, [user]);
  
  // Effet pour forcer la synchronisation si l'utilisateur n'est pas complètement chargé
  React.useEffect(() => {
    if (user && !isUserFullyLoaded) {
      // Attendre un peu puis forcer la synchronisation
      const timer = setTimeout(() => {
        if (!isUserFullyLoaded) {
          syncUser();
        }
      }, 1000); // 1 seconde de délai
      
      return () => clearTimeout(timer);
    }
  }, [user, isUserFullyLoaded, syncUser]);

  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleMessageModalOpen = () => {
    setMessageModalOpen(true);
  };

  const handleMessageModalClose = () => {
    setMessageModalOpen(false);
    // Recharger les statistiques après fermeture du modal
    loadMessageStats();
  };

  return (
    <Box component="nav"
      sx={{
        bgcolor: isScrolled ? 'white' : 'primary.main',
        color: isScrolled ? 'primary.main' : 'white',
        py: 2,
        px: '3%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        height: '70px',
        boxShadow: isScrolled ? '0 4px 16px rgba(76, 0, 130, 0.14)' : '0 2px 10px rgba(0,0,0,0.1)',
        transition: 'all 0.3s',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}
      >
        <img src={isScrolled ? "/logo-sm-acer (1).png" : "/logo-sm-acer.png"} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
        <Typography sx={{ cursor: 'pointer', color: isScrolled ? 'primary.main' : 'white' }} variant="h6">{i18nService.t('home.welcome.subtitle')}</Typography>
      </Box>

      {/* Menu hamburger visible sur mobile */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="end"
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Navigation classique visible sur desktop */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {(permissions.isAdmin || permissions.isSuperAdmin || permissions.isCollecteurReseaux || permissions.isManager) && (
            <Button
              variant=""
              color="white"
              onClick={() => navigate('/networks')}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                px: 2,
              }}
            >
              {i18nService.t('navigation.networks')}
            </Button>
          )}
          <Box
            onMouseEnter={() => setServicesMenuOpen(true)}
            onMouseLeave={() => setServicesMenuOpen(false)}
            sx={{
              position: 'relative',
            }}
          >{(permissions.isSuperviseur || permissions.isAdmin || permissions.isSuperAdmin || permissions.isCollecteurCulte || permissions.isManager) &&
            (<Button
              variant=""
              color="white"
              endIcon={<ArrowDropDown />}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                px: 2,
              }}
            >
              {i18nService.t('navigation.services.title')}
            </Button>)}
            <Paper
              className="menu-dropdown"
              sx={{
                position: 'absolute',
                top: '100%',
                right: 0,
                mt: 1,
                minWidth: '200px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 1000,
                bgcolor: 'background.paper',
                py: 1,
                opacity: servicesMenuOpen ? 1 : 0,
                visibility: servicesMenuOpen ? 'visible' : 'hidden',
                transform: servicesMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease',
              }}
            >
              {(permissions.isSuperviseur || permissions.isAdmin || permissions.isSuperAdmin || permissions.isManager) && (
                <MenuItem
                  onClick={() => navigate('/services/list')}
                  sx={{
                    py: 1,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  {i18nService.t('navigation.services.view')}
                </MenuItem>
              )}
              {(permissions.isCollecteurCulte || permissions.isAdmin || permissions.isSuperAdmin || permissions.isManager) && (
                <MenuItem
                  onClick={() => navigate('/services/new')}
                  sx={{
                    py: 1,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  {i18nService.t('navigation.services.add')}
                </MenuItem>
              )}
            </Paper>
          </Box>
        </Box>

        {/* Bouton de messagerie pour tous les utilisateurs */}
        {user && (
          <IconButton
            color="inherit"
            onClick={handleMessageModalOpen}
            sx={{ ml: 1 }}
            title={i18nService.t('navigation.messaging')}
          >
            <Badge 
              badgeContent={messageStats.unread_count} 
              color="error"
              invisible={messageStats.unread_count === 0}
            >
              <MessageIcon />
            </Badge>
          </IconButton>
        )}

        <UserMenu
          anchorEl={anchorEl}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
        />
      </Box>
      {/* Drawer pour mobile */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 270,
            bgcolor: 'background.paper',
            boxShadow: 6,
          },
        }}
      >
        <Box
          sx={{ width: 270, p: 0 }}
          role="presentation"
          onClick={handleDrawerToggle}
          onKeyDown={handleDrawerToggle}
        >
          {/* Header/logo du menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 700, color: 'white' }}>{i18nService.t('common.menu')}</Typography>
          </Box>
          <Divider />
          <List sx={{ p: 0 }}>
            {(permissions.isSuperviseur || permissions.isAdmin || permissions.isSuperAdmin || permissions.isCollecteurReseaux || permissions.isManager) && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigate('/networks')} sx={{ py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Groups color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={i18nService.t('navigation.networks')} primaryTypographyProps={{ fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            )}

            <Divider sx={{ my: 1 }} />

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/services/list')} sx={{ py: 2 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <EventAvailable color="primary" />
                </ListItemIcon>
                                  <ListItemText primary={i18nService.t('navigation.services.view')} primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/services/new')} sx={{ py: 2 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <EventNote  color="primary" />
                </ListItemIcon>
                                  <ListItemText primary={i18nService.t('navigation.services.add')} primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ my: 1 }} />

            {/* Bouton de messagerie pour tous les utilisateurs */}
            {user && (
              <ListItem disablePadding>
                <ListItemButton onClick={handleMessageModalOpen} sx={{ py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Badge 
                      badgeContent={messageStats.unread_count} 
                      color="error"
                      invisible={messageStats.unread_count === 0}
                    >
                      <MessageIcon color="primary" />
                    </Badge>
                  </ListItemIcon>
                  <ListItemText 
                    primary={i18nService.t('navigation.messaging')} 
                    primaryTypographyProps={{ fontWeight: 500 }} 
                  />
                </ListItemButton>
              </ListItem>
            )}

            <ListItem disablePadding>
              <ListItemButton onClick={handleProfile} sx={{ py: 2 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <AccountCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary={i18nService.t('navigation.profile')} primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>

            {user && (permissions.isAdmin || permissions.isSuperAdmin || permissions.isManager) && (
              <ListItem disablePadding>
                <ListItemButton onClick={handleDashboard} sx={{ py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <DashboardCustomize color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={i18nService.t('navigation.dashboard')} primaryTypographyProps={{ fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            )}

            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ py: 2, color: 'error.main' }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Logout color="error" />
                </ListItemIcon>
                <ListItemText primary={i18nService.t('navigation.logout')} primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>

          </List>
        </Box>
      </Drawer>

      {/* Modal de messagerie */}
      <MessageModal
        open={messageModalOpen}
        onClose={handleMessageModalClose}
        messageStats={messageStats}
      />
    </Box>
  );
};

export default Navbar;
