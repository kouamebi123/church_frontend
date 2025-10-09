import React, { useEffect, useMemo } from 'react';
import { Typography, Grid, CircularProgress, Box, Paper, IconButton, Button } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useGlobalCache } from '@hooks/useGlobalCache';
import { formatQualificationWithFallback } from '@utils/qualificationFormatter';
import { QUALIFICATION_OPTIONS } from '@constants/enums';
import i18nService from '@services/i18nService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#B455C6', '#FF6666', '#82ca9d', '#8884d8', '#ffc658', '#a4de6c', '#d0ed57'];

const StatsMembres = ({ selectedChurch }) => {
    // Debug: afficher la valeur de selectedChurch
    // Debug de l'église sélectionnée - Supprimé pour la production

    // Fonction utilitaire pour calculer l'âge
    const calculateAge = (dateNaissance) => {
        const today = new Date();
        const birthDate = new Date(dateNaissance);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Utilisation du cache global pour éviter les rechargements
    const { data: users, loading: cacheLoading, error: cacheError, refresh: fetchUsers } = useGlobalCache(
        `users-stats-${selectedChurch?.id || 'none'}`,
        async () => {
            // Ne pas faire d'appel API si selectedChurch n'est pas valide
            if (!selectedChurch) {
                return [];
            }
            const { apiService } = await import('../../../services/apiService');
            
            // Utiliser getAll avec filtre par église
            const params = { churchId: selectedChurch.id };
            const usersRes = await apiService.users.getAll(params);
            const allUsers = usersRes.data?.data || usersRes.data || [];
            
            // Filtrer les utilisateurs de cette église
            const filteredUsers = allUsers.filter(user => 
                user.eglise_locale_id === selectedChurch.id || 
                user.eglise_locale?.id === selectedChurch.id
            );
            
            return filteredUsers;
        },
        {
            ttl: 5 * 60 * 1000, // 5 minutes
            staleWhileRevalidate: true
        }
    );

    // Rafraîchissement automatique quand selectedChurch change
    useEffect(() => {
        if (selectedChurch) {
            // Rafraîchir les données avec un délai pour éviter les appels simultanés
            const timer = setTimeout(() => {
                fetchUsers();
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [selectedChurch]); // Dépendance unique : selectedChurch

    // Calcul des stats qualification à partir des users non isolés
    const qualificationStats = useMemo(() => {
        if (!users || users.length === 0) return [];
        
        const stats = {};
        users.forEach(user => {
            const qualification = user.qualification || 'Non définie';
            
            // Trouver le label correspondant dans QUALIFICATION_OPTIONS
            let displayName = 'Non définie';
            if (qualification !== 'Non définie') {
                const option = QUALIFICATION_OPTIONS.find(opt => opt.value === qualification);
                displayName = option ? option.label : formatQualificationWithFallback(qualification, qualification);
            }
            
            if (!stats[displayName]) {
                stats[displayName] = { name: displayName, value: 0 };
            }
            stats[displayName].value++;
        });
        
        const result = Object.values(stats).sort((a, b) => b.value - a.value);
        return result;
    }, [users]);

    // Calcul des stats par genre
    const genreStats = useMemo(() => {
        if (!users || users.length === 0) return [];
        const stats = {};
        users.forEach(user => {
            const genre = user.genre || 'Non défini';
            if (!stats[genre]) {
                stats[genre] = { name: genre, value: 0 };
            }
            stats[genre].value++;
        });
        return Object.values(stats).sort((a, b) => b.value - a.value);
    }, [users]);

    // Calcul des stats par tranche d'âge
    const ageStats = useMemo(() => {
        if (!users || users.length === 0) return [];
        
        const stats = {};
        users.forEach(user => {
            // Utiliser directement le champ tranche_age de l'utilisateur
            const tranche = user.tranche_age || 'Non définie';
            
            if (!stats[tranche]) {
                stats[tranche] = { name: tranche, value: 0 };
            }
            stats[tranche].value++;
        });
        
        // Trier selon l'ordre logique des tranches d'âge
        const order = [
            '0 - 2 ans', '2 ans - 6 ans', '7 ans - 12 ans', '13 ans - 18 ans', 
            '19 ans - 25 ans', '26 ans - 35 ans', '36 ans - 55 ans', 
            '56 ans - 85 ans', '85 ans et plus', 'Non définie'
        ];
        
        const result = Object.values(stats).sort((a, b) => {
            const aIndex = order.indexOf(a.name);
            const bIndex = order.indexOf(b.name);
            // Mettre "Non définie" à la fin
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
        
        return result;
    }, [users]);

    // Calcul des stats par ville de résidence
    const villeStats = useMemo(() => {
        if (!users || users.length === 0) return [];
        const stats = {};
        users.forEach(user => {
            const ville = user.ville_residence || 'Non définie';
            if (!stats[ville]) {
                stats[ville] = { name: ville, value: 0 };
            }
            stats[ville].value++;
        });
        return Object.values(stats).sort((a, b) => b.value - a.value).slice(0, 10); // Top 10
    }, [users]);

    // 4. Bar chart qualification (trié par ordre décroissant)
    const qualifBarStats = useMemo(() => {
        return qualificationStats
            .map(q => ({ qualification: q.name, count: q.value }))
            .sort((a, b) => b.count - a.count);
    }, [qualificationStats]);

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
              background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Statistiques Membres
          </Typography>
          <Box sx={{ 
            width: 80, 
            height: 4, 
            background: 'linear-gradient(90deg, #662d91, #9e005d, #9e005d)',
            borderRadius: 2
          }} />
        </Box>
        <IconButton 
          onClick={fetchUsers} 
          disabled={cacheLoading} 
          aria-label={i18nService.t('common.actions.refresh')}
          sx={{
            background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #1b1464, #662d91)',
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
        <Typography color="error">{cacheError}</Typography>
      ) : (
        <Grid>
          {/* Répartition par qualification */}
          <Grid data-aos="fade-up" item xs={12} md={6} sx={{ mt: 4 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4,
                borderRadius: '20px',
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                border: '2px solid rgba(102, 45, 145, 0.1)',
                boxShadow: '0 10px 40px rgba(102, 45, 145, 0.08)',
                overflowX: 'auto' 
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
              >{i18nService.t('home.qualificationDistribution')}</Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={qualifBarStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="qualification" angle={-30} textAnchor="end" interval={0} height={80} />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          {/* Répartition par genre */}
          <Grid data-aos="fade-up" item xs={12} md={6} sx={{ mt: 4 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4,
                borderRadius: '20px',
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                border: '2px solid rgba(102, 45, 145, 0.1)',
                boxShadow: '0 10px 40px rgba(102, 45, 145, 0.08)',
                overflowX: 'auto' 
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
              >{i18nService.t('home.genreDistribution')}</Typography>
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={genreStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={200}
                    label={({ name, value }) => {
                      const total = genreStats.reduce((sum, g) => sum + g.value, 0);
                      const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                      return `${name}: ${value} (${percent}%)`;
                    }}
                  >
                    {genreStats.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Répartition par âge */}
          <Grid data-aos="fade-up" item xs={12} md={6} sx={{ mt: 4 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4,
                borderRadius: '20px',
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                border: '2px solid rgba(102, 45, 145, 0.1)',
                boxShadow: '0 10px 40px rgba(102, 45, 145, 0.08)',
                overflowX: 'auto' 
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
              >{i18nService.t('home.ageDistribution')}</Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={ageStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

        </Grid>
      )}
    </Box>
  );
};

export default StatsMembres;
