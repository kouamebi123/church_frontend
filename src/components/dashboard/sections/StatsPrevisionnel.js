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
  CardActions,
  Chip
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TYPES_CULTE_OPTIONS } from '../../../constants/enums';
import i18nService from '../../../services/i18nService';
import previsionnelService from '../../../services/previsionnelService';
import apiService from '../../../services/apiService';

const StatsPrevisionnel = ({ selectedChurch, user }) => {
  // Fonction pour obtenir la semaine précédente au format "YYYY-Www" (ISO 8601)
  const getPreviousWeek = () => {
    const now = new Date();
    
    // Utiliser la logique ISO 8601 pour calculer la semaine
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
    
    // Soustraire 1 pour obtenir la semaine précédente
    weekNumber = weekNumber - 1;
    
    // Gérer le cas où on est en semaine 1 (retourner la semaine 52/53 de l'année précédente)
    if (weekNumber <= 0) {
      const lastYear = year - 1;
      // Approximativement 52 semaines par an
      weekNumber = 52;
      return `${lastYear}-W${weekNumber.toString().padStart(2, '0')}`;
    }
    
    
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  const [filters, setFilters] = useState({
    church_id: selectedChurch?.id || '',
    network_id: '',
    type_culte: '',
    date_from: getPreviousWeek()
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
      if (filters.date_from && filters.date_from.includes('-W')) {
        try {
          const [year, week] = filters.date_from.split('-W');
          const weekNum = parseInt(week);
          
          // Méthode plus robuste pour calculer les dates de semaine
          // Utiliser ISO week date (semaine 1 = première semaine avec jeudi)
          const firstDayOfYear = new Date(year, 0, 1);
          const firstThursdayOfYear = new Date(year, 0, 1);
          
          // Trouver le premier jeudi de l'année
          while (firstThursdayOfYear.getDay() !== 4) { // 4 = jeudi
            firstThursdayOfYear.setDate(firstThursdayOfYear.getDate() + 1);
          }
          
          // Calculer le lundi de la semaine demandée
          const mondayOfWeek = new Date(firstThursdayOfYear);
          mondayOfWeek.setDate(firstThursdayOfYear.getDate() + (weekNum - 1) * 7 - 3); // -3 pour aller au lundi
          
          // Calculer le dimanche de la semaine demandée
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
      const response = await previsionnelService.getStats(apiFilters);
      
      if (response.success) {
        const apiStats = response.data;
        
        // Transformer les données de l'API pour correspondre à notre structure
        const transformedStats = {
          total_previsionnel: apiStats.total_previsionnel || 0,
          total_effectif_reel: apiStats.total_effectif || 0,
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
  const formatWeekDate = (weekValue) => {
    if (!weekValue) return '';
    
    try {
      // Le format week est "YYYY-Www" où ww est le numéro de semaine
      const [year, week] = weekValue.split('-W');
      const weekNum = parseInt(week);
      
      // Utiliser la même logique ISO 8601 que getPreviousWeek
      const startOfYear = new Date(year, 0, 1);
      const firstThursdayOfYear = new Date(year, 0, 1);
      
      // Trouver le premier jeudi de l'année
      while (firstThursdayOfYear.getDay() !== 4) { // 4 = jeudi
        firstThursdayOfYear.setDate(firstThursdayOfYear.getDate() + 1);
      }
      
      // Calculer le dimanche de la semaine demandée
      const mondayOfWeek = new Date(firstThursdayOfYear);
      mondayOfWeek.setDate(firstThursdayOfYear.getDate() + (weekNum - 1) * 7 - 3); // -3 pour aller au lundi
      
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
      
      return `Semaine ${weekNum} (${sundayOfWeek.toLocaleDateString('fr-FR', options)})`;
    } catch (error) {
      return weekValue;
    }
  };

  // Préparer les données pour le graphique
  const chartData = stats?.chartData || [];
  const totalPrevisionnel = stats?.total_previsionnel || 0;
  const totalEffectifReel = stats?.total_effectif_reel || 0;
  const difference = totalPrevisionnel - totalEffectifReel;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {i18nService.t('previsionnel.dashboard.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {i18nService.t('previsionnel.dashboard.subtitle')}
      </Typography>

      {/* Filtres */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {i18nService.t('previsionnel.dashboard.filters.title')}
        </Typography>
        
        <Grid container spacing={3} alignItems="flex-start">
          {/* Réseau */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="stats-previsionnel-network-label">{i18nService.t('previsionnel.dashboard.filters.network')}</InputLabel>
              <Select
                id="stats-previsionnel-network"
                name="network_id"
                sx={{ minWidth: '100px' }}
                value={filters.network_id}
                onChange={(e) => handleFilterChange('network_id', e.target.value)}
                label={i18nService.t('previsionnel.dashboard.filters.network')}
                labelId="stats-previsionnel-network-label"
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
              <InputLabel id="stats-previsionnel-type-label">{i18nService.t('previsionnel.dashboard.filters.type')}</InputLabel>
              <Select
                id="stats-previsionnel-type"
                name="type_culte"
                sx={{ minWidth: '100px' }}
                value={filters.type_culte}
                onChange={(e) => handleFilterChange('type_culte', e.target.value)}
                label={i18nService.t('previsionnel.dashboard.filters.type')}
                labelId="stats-previsionnel-type-label"
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
              id="stats-previsionnel-week"
              name="date_from"
              type="week"
              label="Semaine"
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
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Prévisionnel
                </Typography>
                <Typography variant="h4">
                  {totalPrevisionnel}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Effectif Réseau
                </Typography>
                <Typography variant="h4">
                  {totalEffectifReel}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Différence
                </Typography>
                <Typography variant="h4" color={difference >= 0 ? 'success.main' : 'error.main'}>
                  {difference >= 0 ? '+' : ''}{difference}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Graphique comparatif */}
      {chartData.length > 0 ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {i18nService.t('previsionnel.dashboard.chart.title')}
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
                fill="#8884d8" 
                name={i18nService.t('previsionnel.dashboard.chart.effectifReel')}
              />
              <Bar 
                dataKey="previsionnel" 
                fill="#82ca9d" 
                name={i18nService.t('previsionnel.dashboard.chart.previsionnel')}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      ) : (
        !loading && !error && (
          <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {i18nService.t('previsionnel.dashboard.chart.noData')}
            </Typography>
          </Paper>
        )
      )}

      {/* Tableau détaillé */}
      {stats?.details && stats.details.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {i18nService.t('previsionnel.dashboard.table.title')}
          </Typography>
          
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    {i18nService.t('previsionnel.dashboard.table.network')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    {i18nService.t('previsionnel.dashboard.table.type')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    {i18nService.t('previsionnel.dashboard.table.date')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    {i18nService.t('previsionnel.dashboard.table.effectifReel')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    {i18nService.t('previsionnel.dashboard.table.previsionnel')}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                    {i18nService.t('previsionnel.dashboard.table.difference')}
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
                    <td style={{ padding: '12px' }}>{detail.previsionnel}</td>
                    <td style={{ padding: '12px' }}>
                      <Chip
                        label={detail.difference >= 0 ? `+${detail.difference}` : detail.difference}
                        color={detail.difference >= 0 ? 'success' : 'error'}
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

export default StatsPrevisionnel;