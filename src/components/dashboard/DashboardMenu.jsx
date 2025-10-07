import React, { useEffect } from 'react';
import {
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Collapse,
  styled
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Menu as MenuIcon,
  People as PeopleIcon,
  Church as ChurchIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  GroupWork as GroupWorkIcon,
  Event as EventIcon,
  AccountTree as AccountTreeIcon,
  PeopleAlt as PeopleAltIcon,
  BusinessCenter as BusinessCenterIcon,
  Collections as CollectionsIcon,
  InsertChart as InsertChartIcon,
  ReplyAllOutlined as ReplyAllOutlinedIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { usePermissions } from '@hooks/usePermissions';
import { menuItems } from '@constants/menuItems';
import i18nService from '@services/i18nService';
import { useLanguageThemeSync } from '@hooks/useLanguageThemeSync';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 320;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  overflowX: 'hidden',
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: 'linear-gradient(180deg, #4C1D95 0%, #5B21B6 50%, #6D28D9 100%)',
    color: theme.palette.primary.contrastText,
    overflowX: 'hidden',
    boxShadow: '4px 0 20px rgba(91, 33, 182, 0.15)',
  },
}));

const StyledListItem = styled(({ active, ...rest }) => <ListItem {...rest} />)(
  ({ theme, active }) => ({
    margin: '8px 16px',
    borderRadius: '12px',
    backgroundColor: active ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: active ? 'blur(10px)' : 'none',
    border: active ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      transform: 'translateX(4px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  })
);

const DashboardMenu = ({
  activeSection,
  expandedItems,
  onSectionChange,
  onToggleExpanded,
  onLogout,
  mobileOpen,
  setMobileOpen,
  selectedChurch,
  setSelectedChurch,
  showChurchFilter,
  user,
  permissions
}) => {
  // Initialiser le service i18n et synchroniser avec les changements de langue
  useEffect(() => {
    i18nService.init();
  }, []);

  const lastUpdate = useLanguageThemeSync();

  const {
    isManager,
    canAccessConfig
  } = usePermissions();
  
  const navigate = useNavigate();

  const handleMenuClick = (item) => {
    if (item.children) {
      onToggleExpanded(item.text);
    } else {
      onSectionChange(item.id);
    }
  };
  const handleSubMenuClick = (subItem) => {
    onSectionChange(subItem.id);
  };

  // Fonction pour traduire les éléments du menu
  const translateMenuItem = (item) => {
    const translations = {
      'Statistiques': i18nService.t('dashboard.menu.statistics'),
      'Réseaux': i18nService.t('dashboard.menu.networks'),
      'Membres': i18nService.t('dashboard.menu.members'),
      'Mission et Implantation': i18nService.t('dashboard.menu.mission'),
      'Configuration': i18nService.t('dashboard.menu.configuration'),
      "Vue d'ensemble": i18nService.t('dashboard.menu.overview'),
      'Cultes': i18nService.t('dashboard.menu.services'),
      'Gestion des réseaux': i18nService.t('dashboard.menu.networkManagement'),
      'Récapitulatif des effectifs': i18nService.t('dashboard.menu.networkRecap'),
      'Gestion des membres': i18nService.t('dashboard.menu.memberManagement'),
      'Membres retirés': i18nService.t('dashboard.menu.retiredMembers'),
      'Carte interactive': i18nService.t('dashboard.menu.interactiveMap'),
      'Églises': i18nService.t('dashboard.menu.churches'),
      'Départements': i18nService.t('dashboard.menu.departments'),
      'Carousel': i18nService.t('dashboard.menu.carousel'),
      'Historique': i18nService.t('dashboard.menu.history'),
      'Activités': i18nService.t('dashboard.menu.activities')
    };

    return {
      ...item,
      text: translations[item.text] || item.text,
      children: item.children ? item.children.map(child => ({
        ...child,
        text: translations[child.text] || child.text
      })) : undefined
    };
  };

  // Filtrer et traduire les éléments du menu selon les permissions
  const filteredMenuItems = menuItems
    .filter(item => {
      // Masquer la section Configuration pour le manager
      if (item.text === 'Configuration' && !canAccessConfig) {
        return false;
      }
      return true;
    })
    .map(translateMenuItem);

  const drawer = (
    <div>
      <Toolbar>
        <Typography
          variant="h4"
          noWrap
          sx={{ color: 'white', fontWeight: 'bold', letterSpacing: 2, py: 2, cursor: 'pointer' }}
          onClick={() => window.location.reload()}
        >
          {isManager ? i18nService.t('dashboard.menu.management') : i18nService.t('dashboard.menu.administration')}
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
      <List>
        {filteredMenuItems.map((item) => (
          <React.Fragment key={item.text || item.id}>
            <StyledListItem
              active={activeSection === item.id ? 1 : 0}
              onClick={() => handleMenuClick(item)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
              />
              {item.children && (
                <ExpandMoreIcon
                  sx={{
                    color: 'white',
                    marginLeft: 'auto',
                    marginRight: '9px',
                    transition: 'transform 0.2s',
                    transform: expandedItems.includes(item.text) ? 'rotate(0deg)' : 'rotate(-90deg)'
                  }}
                />
              )}
            </StyledListItem>
            {item.children && (
              <Collapse in={expandedItems.includes(item.text)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((sub) => (
                    <StyledListItem
                      key={sub.id}
                      sx={{ pl: 4, background: activeSection === sub.id ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                      active={activeSection === sub.id ? 1 : 0}
                      onClick={() => handleSubMenuClick(sub)}
                    >
                      <ListItemIcon>{sub.icon}</ListItemIcon>
                      <ListItemText
                        primary={sub.text}
                        sx={{ '& .MuiListItemText-primary': { color: 'white' } }}
                      />
                    </StyledListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
        <StyledListItem onClick={() => navigate('/')}>
          <ListItemIcon>
            <ReplyAllOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary={i18nService.t('dashboard.menu.backToSite')}
            sx={{
              '& .MuiListItemText-primary': {
                color: 'white',
                fontWeight: 'bold'
              }
            }}
          />
        </StyledListItem>
      </List>
    </div>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <StyledDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' } }}
      >
        {drawer}
      </StyledDrawer>
      <StyledDrawer
        variant="permanent"
        sx={{ display: { xs: 'none', sm: 'block' } }}
        open
      >
        {drawer}
      </StyledDrawer>
    </Box>
  );
};

export default DashboardMenu; 