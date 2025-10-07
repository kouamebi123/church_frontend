import React, { useEffect } from 'react';
import { Typography, Box, Paper, CircularProgress, IconButton } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { apiService } from '@services/apiService';
import { useGlobalCache } from '@hooks/useGlobalCache';
import RefreshIcon from '@mui/icons-material/Refresh';
import { TRANCHE_AGE_OPTIONS } from '@constants/enums';
import i18nService from '@services/i18nService';

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

const StatsCultes = ({ selectedChurch }) => {
    // Debug: afficher la valeur de selectedChurch
    // Debug de l'église sélectionnée - Supprimé pour la production

    // Utilisation du cache global pour éviter les rechargements
    const { data: serviceAttendance, loading: cacheLoading, error: cacheError, refresh: fetchServices } = useGlobalCache(
        `services-${selectedChurch || 'none'}`,
        async () => {
            // Ne pas faire d'appel API si selectedChurch n'est pas valide
            if (!selectedChurch) {
                return [];
            }
            const now = new Date();
            const startMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            const start = startMonth.toISOString().slice(0, 10);
            const end = endMonth.toISOString().slice(0, 10);
            
            const params = { start, end, churchId: selectedChurch.id };
            
            const res = await apiService.services.getAll(params);
            return res.data?.data || res.data || [];
        },
        { ttl: 5 * 60 * 1000, staleWhileRevalidate: true }
    );

    // Rafraîchissement automatique quand selectedChurch change
    useEffect(() => {
        if (selectedChurch) {
            // Rafraîchir les données avec un délai pour éviter les appels simultanés
            const timer = setTimeout(() => {
                fetchServices();
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [selectedChurch]); // Dépendance unique : selectedChurch

    // Préparation des données pour LineChart (8 derniers dimanches)
    const chartData = React.useMemo(() => {
        if (!serviceAttendance || serviceAttendance.length === 0) return [];
        // Obtenir les 8 derniers dimanches distincts présents dans serviceAttendance
        const allDays = serviceAttendance.map(s => new Date(s.date).toISOString().slice(0, 10));
        const uniqueDays = [...new Set(allDays)];
        const sundaysStr = uniqueDays.sort().slice(-8);
        // Pour chaque date, agréger les présences selon le champ 'culte' (Culte 1, 2, 3)
        return sundaysStr.map(dateStr => {
            const entry = { date: new Date(dateStr).toLocaleDateString('fr-FR') };
            ['Culte 1', 'Culte 2', 'Culte 3'].forEach((culteLabel, idx) => {
                const culte = serviceAttendance.find(s =>
                    new Date(s.date).toISOString().slice(0, 10) === dateStr &&
                    s.culte === culteLabel
                );
                entry[`culte${idx + 1}`] = culte ?
                    (culte.total_adultes || 0)
                    + (culte.total_enfants || 0)
                    + (culte.total_chantres || 0)
                    + (culte.total_protocoles || 0)
                    + (culte.total_multimedia || 0)
                    + (culte.total_respo_ecodim || 0)
                    + (culte.total_animateurs_ecodim || 0)
                    + (culte.total_enfants_ecodim || 0)
                    : 0;
            });
            return entry;
        });
    }, [serviceAttendance]);

    // === NOUVEAU : données pour chaque culte (audience sans/avec serviteurs) ===
    const serviteursKeys = [
        'total_chantres',
        'total_protocoles',
        'total_multimedia',
        'total_respo_ecodim',
        'total_animateurs_ecodim',
    ];
    
    const makeAudienceData = React.useCallback((culteLabel) => {
        if (!serviceAttendance || serviceAttendance.length === 0) return [];
        const allDays = serviceAttendance.map(s => new Date(s.date).toISOString().slice(0, 10));
        const uniqueDays = [...new Set(allDays)];
        const sundaysStr = uniqueDays.sort().slice(-8);
        return sundaysStr.map(dateStr => {
            const entry = { date: new Date(dateStr).toLocaleDateString('fr-FR') };
            const culte = serviceAttendance.find(s =>
                new Date(s.date).toISOString().slice(0, 10) === dateStr &&
                s.culte === culteLabel
            );
            // Effectif total (avec serviteurs)
            const audienceAvecServiteurs = culte
                ? (culte.total_adultes || 0)
                    + (culte.total_enfants || 0)
                    + (culte.total_chantres || 0)
                    + (culte.total_protocoles || 0)
                    + (culte.total_multimedia || 0)
                    + (culte.total_respo_ecodim || 0)
                    + (culte.total_animateurs_ecodim || 0)
                    + (culte.total_enfants_ecodim || 0)
                : 0;
            // Effectif sans les serviteurs
            const totalServiteurs = culte
                ? serviteursKeys.reduce((sum, key) => sum + (culte[key] || 0), 0)
                : 0;
            const audienceSansServiteurs = audienceAvecServiteurs - totalServiteurs;
            entry.audienceSansServiteurs = audienceSansServiteurs;
            entry.audienceAvecServiteurs = audienceAvecServiteurs;
            return entry;
        });
    }, [serviceAttendance, serviteursKeys]);

    const chartDataCulte1 = React.useMemo(() => makeAudienceData('Culte 1'), [makeAudienceData]);
    const chartDataCulte2 = React.useMemo(() => makeAudienceData('Culte 2'), [makeAudienceData]);
    const chartDataCulte3 = React.useMemo(() => makeAudienceData('Culte 3'), [makeAudienceData]);

    // Fonction pour afficher les erreurs de manière sécurisée
    const renderError = (error) => {
        if (typeof error === 'string') {
            return error;
        } else if (error?.message) {
            return error.message;
        } else if (error?.response?.data?.message) {
            return error.response.data.message;
        } else {
            return 'Une erreur est survenue lors du chargement des données';
        }
    };

    // Protection : ne pas afficher les données si selectedChurch n'est pas valide
    if (!selectedChurch) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <Typography variant="h6" color="text.secondary">
                    Veuillez sélectionner une église pour voir les statistiques
                </Typography>
            </Box>
        );
    }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Box>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Statistiques Cultes
          </Typography>
          <Box sx={{ 
            width: 80, 
            height: 4, 
            background: 'linear-gradient(90deg, #5B21B6, #7C3AED, #8B5CF6)',
            borderRadius: 2
          }} />
        </Box>
        <IconButton 
          onClick={fetchServices} 
          disabled={cacheLoading} 
          aria-label={i18nService.t('common.actions.refresh')}
          sx={{
            background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #4C1D95, #5B21B6)',
              transform: 'rotate(180deg)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>
      {cacheLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : cacheError ? (
        <Typography color="error">
          {renderError(cacheError)}
        </Typography>
      ) : (
        <Paper 
          data-aos="fade-up" 
          elevation={0}
          sx={{ 
            p: 4, 
            height: 520, 
            minWidth: 0, 
            overflowX: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
            border: '2px solid rgba(91, 33, 182, 0.1)',
            boxShadow: '0 10px 40px rgba(91, 33, 182, 0.08)'
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontSize: 22,
              fontWeight: 700,
              color: 'primary.main',
              mb: 3
            }}
          >
            Fréquentation des cultes par culte (8 derniers dimanches)
          </Typography>
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={440}>
              <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="culte1" stroke={COLORS[0]} strokeWidth={2} dot={true} name="Culte 1" />
                <Line type="monotone" dataKey="culte2" stroke={COLORS[1]} strokeWidth={2} dot={true} name="Culte 2" />
                <Line type="monotone" dataKey="culte3" stroke={COLORS[2]} strokeWidth={2} dot={true} name="Culte 3" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}
      {/* Diagramme Culte 1 */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mt: 4,
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
          border: '2px solid rgba(91, 33, 182, 0.1)',
          boxShadow: '0 10px 40px rgba(91, 33, 182, 0.08)'
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontSize: 22,
            fontWeight: 700,
            color: 'primary.main',
            mb: 3
          }}
        >Audience - Culte 1</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartDataCulte1}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="audienceSansServiteurs" stroke="#1976d2" strokeWidth={2} dot={true} name="Audience, à l'exception des serviteurs" />
            <Line type="monotone" dataKey="audienceAvecServiteurs" stroke="#43a047" strokeWidth={2} dot={true} name="Audience, avec les serviteurs" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
      {/* Diagramme Culte 2 */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mt: 4,
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
          border: '2px solid rgba(91, 33, 182, 0.1)',
          boxShadow: '0 10px 40px rgba(91, 33, 182, 0.08)'
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontSize: 22,
            fontWeight: 700,
            color: 'primary.main',
            mb: 3
          }}
        >Audience - Culte 2</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartDataCulte2}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="audienceSansServiteurs" stroke="#1976d2" strokeWidth={2} dot={true} name="Audience, à l'exception des serviteurs" />
            <Line type="monotone" dataKey="audienceAvecServiteurs" stroke="#43a047" strokeWidth={2} dot={true} name="Audience, avec les serviteurs" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
      {/* Diagramme Culte 3 */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mt: 4,
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
          border: '2px solid rgba(91, 33, 182, 0.1)',
          boxShadow: '0 10px 40px rgba(91, 33, 182, 0.08)'
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontSize: 22,
            fontWeight: 700,
            color: 'primary.main',
            mb: 3
          }}
        >Audience - Culte 3</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartDataCulte3}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="audienceSansServiteurs" stroke="#1976d2" strokeWidth={2} dot={true} name="Audience, à l'exception des serviteurs" />
            <Line type="monotone" dataKey="audienceAvecServiteurs" stroke="#43a047" strokeWidth={2} dot={true} name="Audience, avec les serviteurs" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default StatsCultes;
