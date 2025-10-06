import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  AppBar, 
  Toolbar, 
  IconButton, 
  FormControl, 
  Select, 
  MenuItem,
  Chip,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import MessageIcon from '@mui/icons-material/Message';
import DashboardContent from '../components/dashboard/DashboardContent';
import DashboardMenu from '../components/dashboard/DashboardMenu';
import { useChurches } from '../hooks/useApi';
import { usePermissions } from '../hooks/usePermissions';
import { useSelectedChurch } from '../hooks/useSelectedChurch';
import { formatQualificationWithFallback } from '../utils/qualificationFormatter';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { menuItems } from '../constants/menuItems';
import i18nService from '../services/i18nService';
import { formatRole } from '../utils/roleFormatter';
import MessageModal from '../components/MessageModal';
import messageService from '../services/messageService';
import UserMenu from '../components/sections/UserMenu';
import AccessControl from '../components/AccessControl';

// Constants
const drawerWidth = 320;

// Styled Components
const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64,
  backgroundColor: '#f5f5f5',
  minHeight: '100vh',
  width: '100%',
  overflow: 'hidden', // Empêcher le scroll horizontal
  overflowY: 'hidden', // Empêcher explicitement le scroll vertical
  boxSizing: 'border-box', // Inclure padding dans la largeur
}));

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const permissions = usePermissions();
  const { churches } = useChurches();
  const { selectedChurch, changeSelectedChurch } = useSelectedChurch();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // État pour le menu du dashboard
  const [activeSection, setActiveSection] = useState('stats');
  const [expandedItems, setExpandedItems] = useState([i18nService.t('dashboard.expandedItems')]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // États pour la messagerie
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageStats, setMessageStats] = useState({ unread_count: 0 });
  const [messageStatsLoading, setMessageStatsLoading] = useState(false);

  // État pour le menu utilisateur
  const [anchorEl, setAnchorEl] = useState(null);

  // Gestionnaires pour le menu
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    window.location.hash = sectionId;
    
    // Trouver le menu parent du sous-menu cliqué
    const parentMenu = menuItems.find(item => 
      item.children && item.children.some(child => child.id === sectionId)
    );
    
    // Si c'est un sous-menu, ouvrir son menu parent et fermer tous les autres
    if (parentMenu) {
      // Utiliser la même logique de traduction que dans DashboardMenu
      const translations = {
        'Statistiques': i18nService.t('dashboard.menu.statistics'),
        'Réseaux': i18nService.t('dashboard.menu.networks'),
        'Membres': i18nService.t('dashboard.menu.members'),
        'Mission et Implantation': i18nService.t('dashboard.menu.mission'),
        'Configuration': i18nService.t('dashboard.menu.configuration'),
      };
      const translatedParentText = translations[parentMenu.text] || parentMenu.text;
      setExpandedItems(prev => {
        // Garder le menu parent ouvert, fermer les autres
        return [translatedParentText];
      });
    }
  };

  const handleToggleExpanded = (itemText) => {
    setExpandedItems(prev => {
      if (prev.includes(itemText)) {
        // Si on ferme le menu, on le retire de la liste
        return prev.filter(item => item !== itemText);
      } else {
        // Si on ouvre un menu, fermer tous les autres et ouvrir seulement celui-ci
        return [itemText];
      }
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Gestionnaires pour le menu utilisateur
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Gestion du changement d'église
  const handleChurchChange = (churchId) => {
    changeSelectedChurch(churchId);
    
    // Forcer le rafraîchissement des composants Stats
    setRefreshKey(prev => prev + 1);
  };

  // Gestionnaires pour la messagerie
  const handleMessageModalOpen = () => {
    setMessageModalOpen(true);
  };

  const handleMessageModalClose = () => {
    setMessageModalOpen(false);
  };

  // Charger les statistiques de messagerie
  const loadMessageStats = async () => {
    if (!user) return;
    
    setMessageStatsLoading(true);
    try {
      const response = await messageService.getMessageStats();
      if (response.success) {
        setMessageStats(response.data || { unread_count: 0 });
      }
    } catch (error) {
    } finally {
      setMessageStatsLoading(false);
    }
  };

  // Charger les statistiques de messagerie au montage du composant
  useEffect(() => {
    loadMessageStats();
  }, [user]);


  // Vérifier l'accès au dashboard basé sur les permissions
  const hasAccess = permissions.canAccessDashboard;
  
  if (!hasAccess) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h4" color="error">
          {i18nService.t('dashboard.unauthorized')}
        </Typography>
      </Box>
    );
  }

  return (
    <AccessControl allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER']}>
      <Box sx={{ 
        display: 'flex',
        width: '100%',
        overflow: 'hidden', // Empêcher le scroll horizontal au niveau du dashboard principal
        overflowY: 'hidden' // Empêcher explicitement le scroll vertical
      }}>
      {/* AppBar fixe en haut */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography sx={{ color: 'white', flexGrow: 1 }} variant="h6" noWrap>
            {i18nService.t('dashboard.title')}
          </Typography>
          
          {/* Filtre d'église (seulement pour les admins/super-admins) */}
          {!permissions.isManager && churches.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
              <Typography variant="body2" sx={{ color: 'white' }}>
                {i18nService.t('dashboard.church')} :
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  id="dashboard-church-select"
                  name="church"
                  value={selectedChurch?.id || selectedChurch?._id || ''}
                  onChange={(e) => handleChurchChange(e.target.value)}
                  displayEmpty
                  autoComplete="off"
                  renderValue={(value) => {
                    if (!value) {
                      const userChurchId = typeof user?.eglise_locale === 'object'
                        ? (user.eglise_locale.id || user.eglise_locale._id)
                        : user?.eglise_locale;
                      const userChurch = churches.find(church => (church.id || church._id) === userChurchId);
                      return userChurch ? userChurch.nom : i18nService.t('dashboard.selectChurch');
                    }
                    const selectedChurchData = churches.find(church => (church.id || church._id) === value);
                    return selectedChurchData ? selectedChurchData.nom : i18nService.t('dashboard.selectChurch');
                  }}
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.37)',
                    color: 'text.primary',
                    backdropFilter: 'blur(10px)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.11)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.39)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.49)'
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    <Typography sx={{ color: 'rgba(0, 0, 0, 0.5)', fontStyle: 'italic' }}>
                      {i18nService.t('dashboard.selectChurch')}
                    </Typography>
                  </MenuItem>
                  {churches.map((church) => (
                    <MenuItem key={church.id || church._id} value={church.id || church._id}>
                      {church.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          
          {/* Indicateur de rôle - affiché pour tous les utilisateurs */}
          <Chip 
            label={formatRole(user?.current_role || user?.role) || i18nService.t('dashboard.defaultRole')} 
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              mr: 2
            }}
            size="small"
          />
          
          {/* Bouton de messagerie */}
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
          
          {/* Menu utilisateur */}
          <UserMenu
            anchorEl={anchorEl}
            onMenuOpen={handleMenuOpen}
            onMenuClose={handleMenuClose}
          />
        </Toolbar>
      </AppBar>

      {/* Menu latéral */}
      <DashboardMenu
        activeSection={activeSection}
        expandedItems={expandedItems}
        onSectionChange={handleSectionChange}
        onToggleExpanded={handleToggleExpanded}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        selectedChurch={selectedChurch} 
        setSelectedChurch={changeSelectedChurch}
        showChurchFilter={!permissions.isManager}
        user={user}
        permissions={permissions}
      />

      {/* Contenu principal */}
      <MainContent>
        <DashboardContent 
          activeSection={activeSection}
          selectedChurch={selectedChurch} 
          user={user}
          permissions={permissions}
          showChurchFilter={false} // Pas de filtre ici car il est dans l'AppBar
          refreshKey={refreshKey}
        />
      </MainContent>

      {/* Modal de messagerie */}
      <MessageModal
        open={messageModalOpen}
        onClose={handleMessageModalClose}
      />
      </Box>
    </AccessControl>
  );
};

export default Dashboard;

