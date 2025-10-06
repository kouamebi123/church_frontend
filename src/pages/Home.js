import React, { useEffect, useState } from 'react';
import { handleApiError } from '../utils/errorHandler';
import Navbar from '../components/Navbar';
import {
  Grid,
  Typography,
  Paper,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Carousel from '../components/Carousel';
import { AccountTree, SupervisorAccount, GroupWork, EmojiPeople, SentimentDissatisfied, AdminPanelSettings, People, ChildCare, Star, Diversity3, PersonAddAlt1, CoPresent } from '@mui/icons-material';
import Loading from '../components/Loading';
import { apiService } from '../services/apiService';
import { useSelectedChurch } from '../hooks/useSelectedChurch';
import i18nService from '../services/i18nService';
import { useUserSync } from '../hooks/useUserSync';
import { usePermissions } from '../hooks/usePermissions';

const StatCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isTotal'
})(({ theme, isTotal }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  backgroundColor: isTotal ? theme.palette.primary.main : 'white',
  color: isTotal ? 'white' : theme.palette.text.primary,
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
  }
}));

// StyledContainer supprimé car non utilisé

const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isTotal'
})(({ theme, isTotal }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: isTotal ? 'white' : theme.palette.primary.main,
  color: isTotal ? theme.palette.primary.main : 'white',
  marginBottom: theme.spacing(2)
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  fontWeight: 'bold',
  color: theme.palette.text.primary
}));

const Home = () => {
  // Utiliser le hook personnalisé pour la synchronisation de l'utilisateur
  const { user, isUserFullyLoaded, syncUser } = useUserSync();
  const { selectedChurch, changeSelectedChurch, churches } = useSelectedChurch();
  const { isAdmin, isSuperAdmin } = usePermissions();
  const [stats, setStats] = useState(null);

  // Effet pour forcer la synchronisation de l'utilisateur si nécessaire
  useEffect(() => {
    if (user && !isUserFullyLoaded) {
      syncUser();
    }
  }, [user, isUserFullyLoaded, syncUser]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let res;
        if (isAdmin || isSuperAdmin) {
          // Pour les admins, utiliser l'église sélectionnée ou l'église par défaut
          let churchId = null;
          
          if (selectedChurch?.id || selectedChurch?._id) {
            // Si une église est sélectionnée, utiliser son ID
            churchId = selectedChurch.id || selectedChurch._id;
          } else if (user?.eglise_locale) {
            // Sinon, utiliser l'église de l'utilisateur (peut être un ID ou un objet)
            churchId = typeof user.eglise_locale === 'object' ? user.eglise_locale.id || user.eglise_locale._id : user.eglise_locale;
          }
          
          if (churchId) {
            res = await apiService.stats.getOverview({ churchId });
          } else {
            res = await apiService.stats.getOverview();
          }
        } else {
          // Pour les autres utilisateurs, filtrer par leur église
          let churchId = null;
          if (user?.eglise_locale) {
            churchId = typeof user.eglise_locale === 'object' ? user.eglise_locale.id : user.eglise_locale;
          }
          
          if (churchId) {
            res = await apiService.stats.getOverview({ churchId });
          } else {
            res = await apiService.stats.getOverview();
          }
        }
        
        setStats(res.data?.data || res.data || {});
      } catch (err) {
        const processedError = handleApiError(err, i18nService.t('errors.api.loadStats'));
        setStats({}); // Définir des stats vides en cas d'erreur
      }
    };
    fetchStats();
  }, [user, selectedChurch]);

  // Gestion du changement d'église - utilise l'état global
  const handleChurchChange = (churchId) => {
    // Utiliser la fonction du hook pour changer l'église
    changeSelectedChurch(churchId);
  };

  if (!stats) return <Loading titre={i18nService.t('home.statsLoading')} />;

  const statsConfig = [
    { label: i18nService.t('home.gouvernance'), value: stats.total_gouvernance, icon: AdminPanelSettings },
    { label: i18nService.t('home.totalReseaux'), value: stats.total_reseaux, icon: AccountTree },
    { label: i18nService.t('home.responsablesReseaux'), value: stats.total_resp_reseaux, icon: SupervisorAccount },
    { label: i18nService.t('home.totalGr'), value: stats.total_gr, icon: GroupWork },
    { label: i18nService.t('home.responsablesGr'), value: stats.total_resp_gr, icon: EmojiPeople },
    { label: i18nService.t('home.leaders'), value: stats.total_leaders, icon: Star },
    { label: i18nService.t('home.leadersTous'), value: stats.total_leaders_all, icon: Star },
    { label: i18nService.t('home.membresReguliers'), value: stats.total_reguliers, icon: Diversity3 },
    { label: i18nService.t('home.membresEnIntegration'), value: stats.total_integration, icon: PersonAddAlt1 },
    { label: i18nService.t('home.membresIrréguliers'), value: stats.total_irreguliers, icon: SentimentDissatisfied },
    { label: i18nService.t('home.ecodim'), value: stats.total_ecodim, icon: ChildCare },
    { label: i18nService.t('home.responsablesEcodim'), value: stats.total_resp_ecodim, icon: CoPresent },
  ];

  return (
    <Box>
      <Navbar />

      <Carousel />

      <Box width="100%" textAlign="center">
        <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
          {i18nService.t('home.title')}
        </Typography>

        {(isAdmin || isSuperAdmin) && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel id="home-church-select-label">{i18nService.t('home.filterByChurch')}</InputLabel>
              <Select
                id="home-church-select"
                name="church"
                value={selectedChurch?.id || selectedChurch?._id || ''}
                onChange={(e) => handleChurchChange(e.target.value)}
                displayEmpty
                label={i18nService.t('home.filterByChurch')}
                labelId="home-church-select-label"
                autoComplete="off"
                renderValue={(selected) => {
                  if (selectedChurch) {
                    return selectedChurch.nom;
                  }
                  return i18nService.t('home.selectChurch');
                }}
              >
                {churches.map((church) => (
                  <MenuItem key={church.id || church._id} value={church.id || church._id}>{church.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Grid container width="92%" mx="auto">
          {statsConfig.map((stat, index) => (
            <Grid
              data-aos="fade-up"
              key={index}
              sx={{
                width: '100%',
                padding: '10px 10px 10px 10px',
                '@media (min-width:460px) and (max-width:699px)': { width: '50%', height: '270px' },
                '@media (min-width:700px) and (max-width:1099px)': { width: '33.33%', height: '270px' },
                '@media (min-width:1100px) and (max-width:1199px)': { width: '25%', height: '270px' },
                '@media (min-width:1200px) and (max-width:1599px)': { width: '20%', height: '270px' },
                '@media (min-width:1600px)': { width: '20%' },
                flexBasis: 'unset',
                maxWidth: 'unset',
                flexGrow: 0,
                flexShrink: 0,
                height: '100%'
              }}
            >
              <StatCard sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <IconWrapper>
                  <stat.icon sx={{ fontSize: 30 }} />
                </IconWrapper>
                <StyledTypography variant="h6">
                  {stat.label}
                </StyledTypography>
                <StyledTypography variant="h4" color="primary">
                  {stat.value}
                </StyledTypography>
              </StatCard>
            </Grid>
          ))}
          <Grid
            data-aos="fade-up"
            sx={{
              width: '100%',
              padding: '10px 10px 10px 10px',
              '@media (min-width:460px) and (max-width:699px)': { width: '50%', height: '270px' },
              '@media (min-width:700px) and (max-width:1099px)': { width: '33.33%', height: '270px' },
              '@media (min-width:1100px) and (max-width:1199px)': { width: '25%', height: '270px' },
              '@media (min-width:1200px) and (max-width:1599px)': { width: '20%', height: '270px' },
              '@media (min-width:1600px)': { width: '20%' },
              flexBasis: 'unset',
              maxWidth: 'unset',
              flexGrow: 0,
              flexShrink: 0,
              height: '100%'
            }}
          >
            <StatCard isTotal sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
              <IconWrapper isTotal>
                <People sx={{ fontSize: 30, color: 'primary.main' }} />
              </IconWrapper>
              <StyledTypography variant="h6" sx={{ color: 'white' }}>
                {i18nService.t('home.totalEffectif')}
              </StyledTypography>
              <StyledTypography variant="h3" sx={{ color: 'white' }}>
                {stats.total_all}
              </StyledTypography>
            </StatCard>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;
