import React, { useState, useEffect } from 'react';
import i18nService from '@services/i18nService';
import { handleApiError } from '@utils/errorHandler';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Grid,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Navbar from '@components/Navbar';
import { useNavigate } from 'react-router-dom';
import Loading from '@components/Loading';
import SecureErrorMessage from '@components/common/SecureErrorMessage';
import { apiService } from '@services/apiService';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { usePermissions } from '@hooks/usePermissions';
import { useSelectedChurch } from '@hooks/useSelectedChurch';
import { formatQualificationWithFallback } from '@utils/qualificationFormatter';
import AccessControl from '@components/AccessControl';
import { STATUS_OPTIONS } from '@constants/enums';

const NetworkCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
  borderRadius: '20px',
  border: '1px solid rgba(102, 45, 145, 0.1)',
  boxShadow: '0 4px 20px rgba(102, 45, 145, 0.08)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, rgb(59, 20, 100), #662d91, #9e005d)',
    opacity: 0,
    transition: 'opacity 0.4s ease'
  },
  '&:hover': {
    transform: 'translateY(-10px) scale(1.02)',
    boxShadow: '0 15px 50px rgba(102, 45, 145, 0.18)',
    '&::before': {
      opacity: 1
    }
  }
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: '8px',
  background: 'rgba(102, 45, 145, 0.02)',
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(102, 45, 145, 0.05)',
    transform: 'translateX(4px)'
  },
  '& .MuiTypography-subtitle2': {
    fontWeight: 600,
    color: theme.palette.text.secondary
  },
  '& .MuiTypography-root:not(.MuiTypography-subtitle2)': {
    fontWeight: 700,
    color: theme.palette.primary.main
  }
}));

// Fonction pour formater les noms selon la logique demandée
const formatResponsableName = (username) => {
  if (!username) return '';
  
  const statusPrefixes = STATUS_OPTIONS.map(option => option.value);
  const words = username.split(' ');
  const firstWord = words[0];
  const isStatusPrefix = statusPrefixes.includes(firstWord);
  
  if (isStatusPrefix) {
    // Avec préfixe : préfixe + nom suivant (si disponible)
    return words.length >= 2 ? `${firstWord} ${words[1]}` : firstWord;
  } else {
    // Sans préfixe : premier mot seulement
    return firstWord;
  }
};

const Networks = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const permissions = usePermissions();
  const { selectedChurch, changeSelectedChurch, churches } = useSelectedChurch();
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userNetworkId, setUserNetworkId] = useState(null);

  // Récupérer l'ID du réseau de l'utilisateur connecté (collecteur)
  useEffect(() => {
    const fetchUserNetwork = async () => {
      if (user && (user.current_role || user.role) === 'collecteur_reseaux') {
        try {
          const userId = user.id || user._id;
          if (!userId) return; // Sécurité
          const res = await apiService.users.getNetwork(userId);
          setUserNetworkId(res.data.networkId);
        } catch (err) {
          setUserNetworkId(null);
        }
      }
    };
    fetchUserNetwork();
  }, [user]);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        let response;
        if (permissions.isAdmin || permissions.isSuperAdmin || permissions.isManager) {
          // Pour les admins et managers, utiliser l'église sélectionnée
          if (selectedChurch) {
            const churchId = selectedChurch.id || selectedChurch._id;
            response = await apiService.networks.getAll({ churchId });
          } else {
            // Si pas d'église sélectionnée, ne pas afficher de données
            setNetworks([]);
            setLoading(false);
            return;
          }
        } else if (user?.eglise_locale) {
          // Pour les autres utilisateurs, toujours filtrer par leur église
          const userChurchId = typeof user.eglise_locale === 'object' ? user.eglise_locale.id || user.eglise_locale._id : user.eglise_locale;
          response = await apiService.networks.getAll({ churchId: userChurchId });
        } else {
          response = await apiService.networks.getAll();
        }
        const networksData = response.data?.data || response.data || [];

        // Pour chaque réseau, récupérer ses stats via le bon endpoint
        const statsPromises = networksData.map(async (network) => {
          try {
            const statsRes = await apiService.networks.getStatsById(network.id || network._id);
            return { ...network, stats: statsRes.data };
          } catch (err) {
            const processedError = handleApiError(err, `erreur lors de la récupération des stats pour ${network.nom}:`);
            // Si erreur, on garde le réseau sans stats
            return { ...network, stats: null };
          }
        });

        const networksWithStats = await Promise.all(statsPromises);

        // Transformer les données pour correspondre au format attendu
        const transformedNetworks = networksWithStats.map(network => {
          const d = network.stats?.data ?? {};
          
          const transformed = {
            id: network.id || network._id,
            nom: network.nom,
            responsables: network.responsable2?.username
              ? `${formatResponsableName(network.responsable1?.username)} & ${formatResponsableName(network.responsable2?.username)}`
              : formatResponsableName(network.responsable1?.username),
            nb_gr: d.totalGroups ?? 0,
            nb_12: d[12] ?? 0,
            nb_144: d[144] ?? 0,
            nb_1728: d[1728] ?? 0,
            nb_respo_gr: d["Responsables de GR"] ?? 0,
            nb_leader: d["Leader"] ?? 0,
            nb_leader_tous: d["Leader (Tous)"] ?? 0,
            nb_membre: d["Membre simple"] ?? 0
          };
          
          return transformed;
        });

        // Trier les réseaux par ordre décroissant de l'effectif total
        const sortedNetworks = transformedNetworks.sort((a, b) => {
          const totalA = calculateTotal(a);
          const totalB = calculateTotal(b);
          return totalB - totalA; // Ordre décroissant
        });

        setNetworks(sortedNetworks);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNetworks();
  }, [user, selectedChurch]);

  const calculateTotal = (network) => {
    return (
      (network.nb_12 || 0) +
      (network.nb_144 || 0) +
      (network.nb_1728 || 0) +
      (network.nb_leader || 0) +
      (network.nb_membre || 0) +
      (network.responsables ? network.responsables.split('&').length : 0)
    );
  };

  if (loading) return <Loading titre={i18nService.t('networks.loading')} />;
  if (error) return <SecureErrorMessage error={error} title={i18nService.t('errors.loading')} />;

  return (
    <AccessControl allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'COLLECTEUR_RESEAUX']}>
      <Box sx={{ 
        minHeight: '100vh'
      }}>
        <Navbar />

      <Container maxWidth="lg" sx={{ mt: 0, mb: 4, py: 4 }}>
        {/* Titre et filtre d'église sur la même ligne - Responsive */}
        <Box sx={{ 
          mb: 5, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #662d91, #9e005d, #9e005d)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
                mb: 1
              }}
            >
              {i18nService.t('networks.list.title')}
            </Typography>
            <Box 
              sx={{ 
                width: '80px', 
                height: '4px', 
                background: 'linear-gradient(90deg, #662d91, #9e005d, #9e005d)',
                borderRadius: '2px'
              }} 
            />
          </Box>
          
          {/* Filtre d'église pour les admins et super-admins */}
          {(permissions.isAdmin || permissions.isSuperAdmin) && (
            <FormControl sx={{ 
              minWidth: { xs: '100%', sm: 250 },
              maxWidth: { xs: '100%', sm: 300 }
            }}>
              <InputLabel id="church-select-label">{i18nService.t('networks.list.filterByChurch')}</InputLabel>
              <Select
                id="networks-church-select"
                name="church"
                labelId="church-select-label"
                value={selectedChurch?.id || selectedChurch?._id || ''}
                label={i18nService.t('networks.list.filterByChurch')}
                onChange={(e) => {
                  const churchId = e.target.value;
                  changeSelectedChurch(churchId);
                }}
                sx={{ backgroundColor: '#fdfdfd' }}
                autoComplete="off"
              >
                {churches.map((church) => (
                  <MenuItem key={church.id || church._id} value={church.id || church._id}>{church.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
        {networks.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8, 
              px: 2,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'divider',
              mx: 2
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Aucun réseau trouvé
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {selectedChurch 
                ? i18nService.t('networks.noNetworksForChurch', { churchName: selectedChurch.nom })
                : i18nService.t('networks.noNetworksAvailable')
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Les réseaux apparaîtront ici une fois créés
            </Typography>
          </Box>
        ) : (
          <Grid container>
            {networks.map((network) => (
            <Grid data-aos="fade-up" sx={{
              width: '100%',
              padding: '10px 10px 10px 10px',
              '@media (min-width:700px) and (max-width:1099px)': { width: '50%', },
              '@media (min-width:1100px) and (max-width:1599px)': { width: '33.33%', },
              '@media (min-width:1600px)': { width: '25%' },
              flexBasis: 'unset',
              maxWidth: 'unset',
              flexGrow: 0,
              flexShrink: 0,
              height: '100%'
            }} key={network.id}>
              <NetworkCard elevation={2} >
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 3,
                    pb: 2,
                    borderBottom: '2px solid rgba(102, 45, 145, 0.1)'
                  }}
                >
                  {network.nom}
                </Typography>

                <InfoRow>
                  <Typography variant="subtitle2">{i18nService.t('networks.list.responsables')}</Typography>
                  <Typography>{network.responsables || '-'}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">{i18nService.t('networks.list.gr')}</Typography>
                  <Typography>{network.nb_gr}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">{i18nService.t('networks.list.group12')}</Typography>
                  <Typography>{network.nb_12}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">{i18nService.t('networks.list.group144')}</Typography>
                  <Typography>{network.nb_144}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">{i18nService.t('networks.list.group1728')}</Typography>
                  <Typography>{network.nb_1728}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">{i18nService.t('networks.list.responsableGR')}</Typography>
                  <Typography>{network.nb_respo_gr}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">{i18nService.t('networks.list.leader')}</Typography>
                  <Typography>{network.nb_leader}</Typography>
                </InfoRow>
                <InfoRow>
                  <Typography variant="subtitle2">{i18nService.t('networks.list.leaderAll')}</Typography>
                  <Typography>{network.nb_leader_tous}</Typography>
                </InfoRow>

                <InfoRow>
                  <Typography variant="subtitle2">{i18nService.t('networks.list.member')}</Typography>
                  <Typography>{network.nb_membre}</Typography>
                </InfoRow>

                <InfoRow sx={{
                  background: 'linear-gradient(145deg, #F5F3FF 0%, #EDE9FE 100%)',
                  border: '2px solid rgba(102, 45, 145, 0.2)',
                  borderRadius: '12px',
                  p: 2,
                  mt: 2,
                  boxShadow: '0 2px 8px rgba(102, 45, 145, 0.1)'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'primary.main' }}>
                    {i18nService.t('networks.list.total')}
                  </Typography>
                  <Typography sx={{ 
                    fontWeight: 800, 
                    fontSize: '1.4rem',
                    background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {calculateTotal(network)}
                  </Typography>
                </InfoRow>

                <Box sx={{ mt: 'auto', pt: 3 }}>
                  
                  {/* Debug : afficher les IDs pour vérification - Supprimé pour la production */}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/networks/${network.id}`)}
                    disabled={
                      (user?.current_role || user?.role) === 'collecteur_reseaux' &&
                      (userNetworkId === null || String(userNetworkId) !== String(network.id))
                    }
                    sx={{
                      background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: '1rem',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(102, 45, 145, 0.25)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1b1464, #662d91)',
                        boxShadow: '0 8px 20px rgba(102, 45, 145, 0.35)',
                        transform: 'translateY(-2px)'
                      },
                      '&:disabled': {
                        background: 'rgba(102, 45, 145, 0.3)',
                        color: 'white'
                      }
                    }}
                  >
                    {i18nService.t('common.actions.view')}
                  </Button>
                </Box>
              </NetworkCard>
            </Grid>
          ))}
        </Grid>
        )}
      </Container>
      </Box>
    </AccessControl>
  );
};

export default Networks;
