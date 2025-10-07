import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TYPES_CULTE_OPTIONS } from '@constants/enums';
import i18nService from '@services/i18nService';
import assistanceService from '@services/assistanceService';
import apiService from '@services/apiService';

const StatsAssistance = ({ selectedChurch, user }) => {
  // Fonction pour obtenir la semaine actuelle au format "YYYY-Www" (ISO 8601)
  // Dans StatsAssistance, on affiche la semaine actuelle mais les données correspondent à la semaine précédente
  const getCurrentWeek = () => {
    const now = new Date();
    
    // Utiliser la logique ISO 8601 pour calculer la semaine actuelle
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    
    // La semaine 1 est celle qui contient le 4 janvier
    let weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    
    // Ajuster pour les années où le 1er janvier est dans la semaine 52/53 de l'année précédente
    if (weekNumber === 0) {
      const lastYear = year - 1;
      const lastYearStart = new Date(lastYear, 0, 1);
      const lastYearDays = Math.floor((now - lastYearStart) / (24 * 60 * 60 * 1000));
      weekNumber = Math.ceil((lastYearDays + lastYearStart.getDay() + 1) / 7);
    }
    
    
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  const [filters, setFilters] = useState({
    church_id: selectedChurch?.id || '',
    network_id: '',
    type_culte: '',
    date_from: getCurrentWeek()
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [networks, setNetworks] = useState([]);

  // Charger les réseaux disponibles
  useEffect(() => {
    const loadNetworks = async () => {
      try {
        const response = await apiService.networks.getAll({ churchId: selectedChurch?.id });
        
        // Vérifier la structure de la réponse
        const networksData = response.data?.data || response.data || [];
        
        if (Array.isArray(networksData)) {
          setNetworks(networksData);
          
          // Définir automatiquement "Tous les réseaux" et le premier type de culte
          const firstTypeCulte = TYPES_CULTE_OPTIONS.find(option => option.value !== 'Tous');
          
          setFilters(prev => {
            const newFilters = {
              ...prev,
              network_id: '', // "Tous les réseaux" par défaut
              type_culte: firstTypeCulte ? firstTypeCulte.value : ''
            };
            
            return newFilters;
          });
        } else {
          setNetworks([]);
        }
      } catch (error) {
        setNetworks([]);
      }
    };

    if (selectedChurch?.id) {
      loadNetworks();
    } else {
      setNetworks([]);
    }
  }, [selectedChurch]);

  // Charger les statistiques automatiquement quand les filtres changent
  useEffect(() => {
    if (selectedChurch?.id && filters.type_culte && filters.date_from) {
      loadStats();
    }
  }, [selectedChurch?.id, filters.network_id, filters.type_culte, filters.date_from, networks.length]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Préparer les filtres pour l'API en gérant le format de semaine
      const apiFilters = { ...filters };
      
      // Si une date de semaine est sélectionnée, la convertir en plage de dates
      // IMPORTANT: Dans StatsAssistance, la semaine sélectionnée N correspond aux données de la semaine N-1
      if (filters.date_from && filters.date_from.includes('-W')) {
        try {
          const [year, week] = filters.date_from.split('-W');
          let weekNum = parseInt(week);
          
          // Soustraire 1 pour obtenir la semaine précédente (données réelles)
          weekNum = weekNum - 1;
          
          // Gérer le cas où on est en semaine 1 (retourner la semaine 52/53 de l'année précédente)
          if (weekNum <= 0) {
            const lastYear = parseInt(year) - 1;
            weekNum = 52; // Approximativement 52 semaines par an
          }
          
          // Utiliser la semaine N-1 pour calculer les dates
          const targetYear = weekNum <= 0 ? parseInt(year) - 1 : parseInt(year);
          const targetWeek = weekNum <= 0 ? 52 : weekNum;
          
          // Méthode plus robuste pour calculer les dates de semaine
          // Utiliser ISO week date (semaine 1 = première semaine avec jeudi)
          const firstDayOfYear = new Date(targetYear, 0, 1);
          const firstThursdayOfYear = new Date(targetYear, 0, 1);
          
          // Trouver le premier jeudi de l'année
          while (firstThursdayOfYear.getDay() !== 4) { // 4 = jeudi
            firstThursdayOfYear.setDate(firstThursdayOfYear.getDate() + 1);
          }
          
          // Calculer le lundi de la semaine demandée (N-1)
          const mondayOfWeek = new Date(firstThursdayOfYear);
          mondayOfWeek.setDate(firstThursdayOfYear.getDate() + (targetWeek - 1) * 7 - 3); // -3 pour aller au lundi
          
          // Calculer le dimanche de la semaine demandée (N-1)
          const sundayOfWeek = new Date(mondayOfWeek);
          sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
          
          // Vérifier que les dates sont valides
          if (isNaN(mondayOfWeek.getTime()) || isNaN(sundayOfWeek.getTime())) {
            throw new Error('Dates invalides générées');
          }
          
          // Formater les dates pour l'API
          apiFilters.date_from = mondayOfWeek.toISOString().split('T')[0];
          apiFilters.date_to = sundayOfWeek.toISOString().split('T')[0];
        } catch (error) {
          // En cas d'erreur, utiliser la date telle quelle
          delete apiFilters.date_from;
        }
      }
      
      // Appel à l'API réelle
      const response = await assistanceService.getStats(apiFilters);
      
      if (response.success) {
        const apiStats = response.data;
        
        // Transformer les données de l'API pour correspondre à notre structure
        const transformedStats = {
          total_presents: apiStats.total_presents || 0,
          total_effectif_reel: apiStats.effectif_reel || 0,
          chartData: apiStats.chart_data || [],
          details: apiStats.details || []
        };
        
        setStats(transformedStats);
      } else {
        setError(response.message || 'Erreur lors du chargement des statistiques');
        setStats(null);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors du chargement des statistiques');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [field]: value
      };
      return newFilters;
    });
  };

  // Fonction pour formater la date de semaine de manière lisible (ISO 8601)
  // Dans StatsAssistance, la semaine sélectionnée N affiche les données de la semaine N-1
  const formatWeekDate = (weekValue) => {
    if (!weekValue) return '';
    
    try {
      // Le format week est "YYYY-Www" où ww est le numéro de semaine
      const [year, week] = weekValue.split('-W');
      const weekNum = parseInt(week);
      
      // Calculer la semaine précédente (données réelles)
      let dataWeekNum = weekNum - 1;
      let dataYear = parseInt(year);
      
      // Gérer le cas où on est en semaine 1 (données de la semaine 52/53 de l'année précédente)
      if (dataWeekNum <= 0) {
        dataYear = parseInt(year) - 1;
        dataWeekNum = 52;
      }
      
      // Utiliser la même logique ISO 8601 pour la semaine des données
      const startOfYear = new Date(dataYear, 0, 1);
      const firstThursdayOfYear = new Date(dataYear, 0, 1);
      
      // Trouver le premier jeudi de l'année
      while (firstThursdayOfYear.getDay() !== 4) { // 4 = jeudi
        firstThursdayOfYear.setDate(firstThursdayOfYear.getDate() + 1);
      }
      
      // Calculer le dimanche de la semaine des données (N-1)
      const mondayOfWeek = new Date(firstThursdayOfYear);
      mondayOfWeek.setDate(firstThursdayOfYear.getDate() + (dataWeekNum - 1) * 7 - 3); // -3 pour aller au lundi
      
      // Calculer le dimanche de la semaine (lundi + 6 jours)
      const sundayOfWeek = new Date(mondayOfWeek);
      sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
      
      // Formater en français
      const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      };
      
      return `Semaine ${weekNum} → Données semaine ${dataWeekNum} (${sundayOfWeek.toLocaleDateString('fr-FR', options)})`;
    } catch (error) {
      return weekValue;
    }
  };

  // Préparer les données pour le graphique
  const chartData = stats?.chartData || [];
  const totalPresents = stats?.total_presents || 0;
  const totalEffectifReel = stats?.total_effectif_reel || 0;
  const difference = totalPresents - totalEffectifReel;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
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
          {i18nService.t('assistance.dashboard.title')}
        </Typography>
        <Box sx={{ 
          width: 80, 
          height: 4, 
          background: 'linear-gradient(90deg, #5B21B6, #7C3AED, #8B5CF6)',
          borderRadius: 2,
          mb: 2
        }} />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {i18nService.t('assistance.dashboard.subtitle')}
        </Typography>
      </Box>
      {/* Filtres */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 3,
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
          border: '2px solid rgba(91, 33, 182, 0.1)',
          boxShadow: '0 10px 40px rgba(91, 33, 182, 0.08)'
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}
        >
          {i18nService.t('assistance.dashboard.filters.title')}
        </Typography>
        
        <Grid container spacing={3} alignItems="flex-start">
          {/* Réseau */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="stats-assistance-network-label">{i18nService.t('assistance.dashboard.filters.network')}</InputLabel>
              <Select
                id="stats-assistance-network"
                name="network_id"
                sx={{ minWidth: '100px' }}
                value={filters.network_id}
                onChange={(e) => handleFilterChange('network_id', e.target.value)}
                label={i18nService.t('assistance.dashboard.filters.network')}
                labelId="stats-assistance-network-label"
                autoComplete="off"
              >
                <MenuItem value="">
                  <strong>Tous les réseaux</strong>
                </MenuItem>
                {networks.map((network) => (
                  <MenuItem key={network.id} value={network.id}>
                    {network.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Type de culte */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="stats-assistance-type-label">{i18nService.t('assistance.dashboard.filters.type')}</InputLabel>
              <Select
                id="stats-assistance-type"
                name="type_culte"
                sx={{ minWidth: '100px' }}
                value={filters.type_culte}
                onChange={(e) => handleFilterChange('type_culte', e.target.value)}
                label={i18nService.t('assistance.dashboard.filters.type')}
                labelId="stats-assistance-type-label"
                autoComplete="off"
              >
                <MenuItem value="">Tous</MenuItem>
                {TYPES_CULTE_OPTIONS.filter(option => option.value !== 'Tous').map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date unique */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              id="stats-assistance-week"
              name="date_from"
              type="week"
              label={i18nService.t('common.actions.week')}
              sx={{ minWidth: '100px' }}
              value={filters.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText={filters.date_from ? formatWeekDate(filters.date_from) : "Format: Semaine/Mois/Année"}
              autoComplete="off"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Affichage des erreurs */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistiques globales */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card 
              elevation={0}
              sx={{
                borderRadius: '20px',
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                border: '2px solid rgba(91, 33, 182, 0.1)',
                boxShadow: '0 8px 24px rgba(91, 33, 182, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 36px rgba(91, 33, 182, 0.15)'
                }
              }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                  Total Présents
                </Typography>
                <Typography 
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {totalPresents}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card 
              elevation={0}
              sx={{
                borderRadius: '20px',
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                border: '2px solid rgba(91, 33, 182, 0.1)',
                boxShadow: '0 8px 24px rgba(91, 33, 182, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 36px rgba(91, 33, 182, 0.15)'
                }
              }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                  Effectif Réseau
                </Typography>
                <Typography 
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {totalEffectifReel}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card 
              elevation={0}
              sx={{
                borderRadius: '20px',
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                border: '2px solid rgba(91, 33, 182, 0.1)',
                boxShadow: '0 8px 24px rgba(91, 33, 182, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 36px rgba(91, 33, 182, 0.15)'
                }
              }}
            >
              <CardContent>
                <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 600 }}>
                  Différence
                </Typography>
                <Typography variant="h4" color={difference >= 0 ? 'success.main' : 'error.main'} sx={{ fontWeight: 800 }}>
                  {difference >= 0 ? '+' : ''}{difference}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Graphique comparatif */}
      {chartData.length > 0 ? (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3,
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
            border: '2px solid rgba(91, 33, 182, 0.1)',
            boxShadow: '0 10px 40px rgba(91, 33, 182, 0.08)'
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            {i18nService.t('assistance.dashboard.chart.title')}
          </Typography>
          
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="effectif_reel" 
                fill="var(--chart-purple)" 
                name={i18nService.t('assistance.dashboard.chart.effectifReel')}
              />

              <Bar 
                dataKey="assistance" 
                fill="var(--chart-yellow)" 
                name={i18nService.t('assistance.dashboard.chart.assistance')}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      ) : (
        !loading && !error && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              textAlign: 'center',
              borderRadius: '20px',
              background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
              border: '2px solid rgba(91, 33, 182, 0.1)',
              boxShadow: '0 10px 40px rgba(91, 33, 182, 0.08)'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {i18nService.t('assistance.dashboard.chart.noData')}
            </Typography>
          </Paper>
        )
      )}

      {/* Tableau récapitulatif */}
      {stats?.details && stats.details.length > 0 && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
            border: '2px solid rgba(91, 33, 182, 0.1)',
            boxShadow: '0 10px 40px rgba(91, 33, 182, 0.08)'
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            {i18nService.t('assistance.dashboard.table.title')}
          </Typography>
          
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: 'none', color: 'white', fontWeight: 700 }}>
                    {i18nService.t('assistance.dashboard.table.network')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: 'none', color: 'white', fontWeight: 700 }}>
                    {i18nService.t('assistance.dashboard.table.type')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: 'none', color: 'white', fontWeight: 700 }}>
                    {i18nService.t('assistance.dashboard.table.date')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: 'none', color: 'white', fontWeight: 700 }}>
                    {i18nService.t('assistance.dashboard.table.effectifReel')}
                  </th>

                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: 'none', color: 'white', fontWeight: 700 }}>
                    {i18nService.t('assistance.dashboard.table.assistance')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: 'none', color: 'white', fontWeight: 700 }}>
                    {i18nService.t('assistance.dashboard.table.difference')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.details.map((detail, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{detail.network_name}</td>
                    <td style={{ padding: '12px' }}>{detail.type_culte}</td>
                    <td style={{ padding: '12px' }}>
                      {new Date(detail.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px' }}>{detail.effectif_reel}</td>
                    <td style={{ padding: '12px' }}>{detail.assistance}</td>
                    <td style={{ padding: '12px' }}>
                      <Chip
                        label={detail.assistance - detail.effectif_reel >= 0 ? 
                          `+${detail.assistance - detail.effectif_reel}` : 
                          detail.assistance - detail.effectif_reel}
                        color={detail.assistance - detail.effectif_reel >= 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default StatsAssistance;
