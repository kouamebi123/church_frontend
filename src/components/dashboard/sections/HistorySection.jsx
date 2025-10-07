import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import i18nService from '@services/i18nService';
import { activityService } from '../../../services';
import logger from '@utils/logger';


const HistorySection = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    action: '',
    entity: ''
  });

  // Actions possibles
  const actionTypes = [
    { value: 'CREATE', label: i18nService.t('historys.add'), color: 'success' },
    { value: 'UPDATE', label: i18nService.t('historys.edit'), color: 'info' },
    { value: 'DELETE', label: i18nService.t('historys.delete'), color: 'error' },
    { value: 'LOGIN', label: 'Connexion', color: 'primary' },
    { value: 'LOGOUT', label: 'Déconnexion', color: 'warning' },
    { value: 'VIEW', label: 'Consultation', color: 'default' },
    { value: 'EXPORT', label: 'Export', color: 'secondary' },
    { value: 'IMPORT', label: 'Import', color: 'secondary' }
  ];

  // Entités possibles
  const entityTypes = [
    { value: 'USER', label: 'Utilisateur' },
    { value: 'NETWORK', label: 'Réseau' },
    { value: 'GROUP', label: 'Groupe' },
    { value: 'SERVICE', label: 'Culte' },
    { value: 'CHURCH', label: 'Église' },
    { value: 'DEPARTMENT', label: 'Département' },
    { value: 'TESTIMONY', label: 'Témoignage' },
    { value: 'CAROUSEL', label: 'Carousel' },
    { value: 'PREVISIONNEL', label: 'Prévisionnel' },
    { value: 'ASSISTANCE', label: 'Assistance' },
    { value: 'MESSAGE', label: 'Message' }
  ];

  // Charger les activités
  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await activityService.getHistory({
        page: 1,
        limit: 100,
        action: filters.action || undefined,
        entity_type: filters.entity || undefined
      });

      if (response.success) {
        setActivities(response.data);
      } else {
        setError('Erreur lors du chargement des activités');
      }
    } catch (err) {
      setError('Erreur lors du chargement des activités');
      logger.error('Erreur chargement historique:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  // Recharger quand les filtres changent
  useEffect(() => {
    loadActivities();
  }, [filters]);

  // Filtrer les activités (maintenant fait côté serveur)
  const filteredActivities = activities;

  // Obtenir l'icône pour l'action
  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return <AddIcon />;
      case 'UPDATE': return <EditIcon />;
      case 'DELETE': return <DeleteIcon />;
      default: return null;
    }
  };

  // Obtenir la couleur pour l'action
  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'info';
      case 'DELETE': return 'error';
      case 'LOGIN': return 'primary';
      case 'LOGOUT': return 'warning';
      case 'VIEW': return 'default';
      case 'EXPORT': return 'secondary';
      case 'IMPORT': return 'secondary';
      default: return 'default';
    }
  };

  // Formater la date
  const formatDate = (date) => {
    if (!date) return 'Date inconnue';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Date invalide';
      }
      
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      logger.warn('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };

  // Effacer les filtres
  const clearFilters = () => {
    setFilters({ action: '', entity: '' });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          {i18nService.t('historys.loading')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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
            {i18nService.t('historys.title')}
          </Typography>
          <Box sx={{ 
            width: 80, 
            height: 4, 
            background: 'linear-gradient(90deg, #5B21B6, #7C3AED, #8B5CF6)',
            borderRadius: 2
          }} />
        </Box>
        <Tooltip title="Actualiser les données">
          <IconButton 
            onClick={loadActivities} 
            disabled={loading}
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
        </Tooltip>
      </Box>

      {/* Filtres */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 3,
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
          border: '2px solid rgba(91, 33, 182, 0.1)',
          boxShadow: '0 10px 40px rgba(91, 33, 182, 0.08)'
        }}
      >
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}
          >
            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtres
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3} sx={{ width: '25%'}}>
              <TextField
                select
                fullWidth
                id="history-filter-action"
                name="action"
                label={i18nService.t('historys.filterByAction')}
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                size="small"
                autoComplete="off"
              >
                <MenuItem value="">Toutes les actions</MenuItem>
                {actionTypes.map((action) => (
                  <MenuItem key={action.value} value={action.value}>
                    {action.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: '30%'}}  >
              <TextField
                select
                fullWidth
                id="history-filter-entity"
                name="entity"
                label={i18nService.t('historys.filterByEntity')}
                value={filters.entity}
                onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
                size="small"
                autoComplete="off"
              >
                <MenuItem value="">Toutes les entités</MenuItem>
                {entityTypes.map((entity) => (
                  <MenuItem key={entity.value} value={entity.value}>
                    {entity.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                fullWidth
                size="small"
              >
                {i18nService.t('historys.clearFilters')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tableau des activités */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('historys.user')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('historys.action')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('historys.entity')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>Nom de l'entité</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('historys.timestamp')}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('historys.details')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" color="text.secondary">
                      {i18nService.t('historys.noActivities')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity) => (
                  <TableRow key={activity.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.user}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getActionIcon(activity.action)}
                        label={actionTypes.find(a => a.value === activity.action)?.label || activity.action}
                        color={getActionColor(activity.action)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" textTransform="capitalize">
                        {entityTypes.find(e => e.value === activity.entityType)?.label || 
                         activity.entityType || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.entityName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(activity.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {activity.details}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default HistorySection;
