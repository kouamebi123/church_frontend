import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Mic as MicIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useSelectedChurch } from '../../../hooks/useSelectedChurch';
import { useNotification } from '../../../hooks/useNotification';
import { formatDate } from '../../../utils/dateFormatter';
import { apiService } from '../../../services/apiService';

const TestimoniesCulte = () => {
  const { selectedChurch } = useSelectedChurch();
  const {
    notification,
    showSuccess,
    showError,
    hideNotification
  } = useNotification();
  
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTestimony, setSelectedTestimony] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [showOnlyNotTestified, setShowOnlyNotTestified] = useState(false);

  // Charger les témoignages pour le culte (uniquement ceux confirmés)
  const loadTestimoniesForCulte = async () => {
    if (!selectedChurch?.id) return;
    
    setLoading(true);
    
    try {
      const params = {
        churchId: selectedChurch.id,
        isConfirmed: 'true' // Seulement les témoignages confirmés
      };
      
      if (showOnlyNotTestified) params.hasTestified = 'false';
      
      const response = await apiService.testimonies.getForCulte(params);
      const data = response.data;
      
      if (data.success) {
        setTestimonies(data.data || []);
      } else {
        showError(data.message || 'Erreur lors du chargement des témoignages');
      }
    } catch (err) {
      showError('Erreur de connexion lors du chargement des témoignages');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les témoignages au montage et quand les filtres changent
  useEffect(() => {
    loadTestimoniesForCulte();
  }, [selectedChurch, showOnlyNotTestified]);

  // Gestion des filtres
  const handleNotTestifiedFilterChange = (event) => {
    setShowOnlyNotTestified(event.target.checked);
  };

  // Voir un témoignage
  const handleViewTestimony = (testimony) => {
    setSelectedTestimony(testimony);
    setViewDialogOpen(true);
  };

  // Marquer comme témoigné
  const handleMarkAsTestified = async (testimony) => {
    try {
      const response = await apiService.testimonies.markAsTestified(testimony.id);
      const data = response.data;

      if (data.success) {
        showSuccess('Témoignage marqué comme effectué');
        loadTestimoniesForCulte(); // Recharger la liste
      } else {
        showError(data.message || 'Erreur lors du marquage');
      }
    } catch (err) {
      showError('Erreur de connexion lors du marquage');
      console.error('Erreur:', err);
    }
  };

  // Actualiser la liste
  const handleRefresh = () => {
    loadTestimoniesForCulte();
  };

  // Formater le nom d'auteur
  const formatAuthorName = (testimony) => {
    if (!testimony) return '—';
    if (testimony.isAnonymous) return 'Anonyme';
    return `${testimony.firstName ?? ''} ${testimony.lastName ?? ''}`.trim() || '—';
  };

  // Formater le type de témoignage
  const formatTestimonyType = (type) => {
    const types = {
      'GOUVERNANCE': 'Gouvernance',
      'ECODIM': 'ECODIM',
      'SECTION': 'Section',
      'VISITOR': 'Visiteur',
      'NETWORK_MEMBER': 'Membre réseau'
    };
    return types[type] || type || '—';
  };

  if (!selectedChurch) {
    return (
      <Alert severity="warning">
        Veuillez sélectionner une église pour voir les témoignages de culte
      </Alert>
    );
  }

  return (
    <Box>
      {/* En-tête avec titre et bouton d'actualisation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Témoignages de culte
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Actualiser
        </Button>
      </Box>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtres
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showOnlyNotTestified}
                    onChange={handleNotTestifiedFilterChange}
                    color="primary"
                  />
                }
                label="Pas encore témoigné"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" justifyContent="center">
                <Chip
                  label={`${testimonies.length} témoignage(s) confirmé(s)`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Liste des témoignages */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : testimonies.length === 0 ? (
        <Alert severity="info">
          Aucun témoignage trouvé pour le culte.
        </Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            {testimonies.map((testimony) => (
              <Grid item xs={12} md={6} lg={4} key={testimony.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: testimony.isConfirmedToTestify ? '2px solid var(--success-confirmed)' : '1px solid var(--network-border)',
                  boxShadow: testimony.isConfirmedToTestify ? '0 4px 12px var(--success-confirmed-shadow)' : 'none'
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" gap={1} alignItems="center">
                        <Chip
                          label={formatTestimonyType(testimony.testimonyType)}
                          color="primary"
                          size="small"
                        />
                        {testimony.section && testimony.unit && (
                          <Chip
                            label={`${testimony.section} - ${testimony.unit}`}
                            color="secondary"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        {formatDate(testimony.createdAt)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {formatAuthorName(testimony)}
                    </Typography>
                    
                    {/* Informations de contact */}
                    <Box sx={{ mb: 2 }}>
                      {testimony.phone && (
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {testimony.phone}
                          </Typography>
                        </Box>
                      )}
                      {testimony.email && (
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {testimony.email}
                          </Typography>
                        </Box>
                      )}
                      {testimony.network?.nom && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {testimony.network.nom}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color="text.primary" 
                      sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2
                      }}
                    >
                      {testimony.content}
                    </Typography>
                    
                    {/* Statuts */}
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {testimony.isConfirmedToTestify && (
                        <Chip
                          label="Confirmé"
                          size="small"
                          color="success"
                        />
                      )}
                      {testimony.hasTestified && (
                        <Chip
                          label="A témoigné"
                          size="small"
                          color="info"
                          icon={<MicIcon />}
                        />
                      )}
                      {testimony.confirmedAt && (
                        <Chip
                          label={`Confirmé le ${formatDate(testimony.confirmedAt)}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" gap={1}>
                        <Tooltip title="Voir le témoignage">
                          <IconButton
                            size="small"
                            onClick={() => handleViewTestimony(testimony)}
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {!testimony.hasTestified && (
                          <Tooltip title="Marquer comme témoigné">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleMarkAsTestified(testimony)}
                            >
                              <MicIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Dialog pour voir un témoignage */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Témoignage de {selectedTestimony && formatAuthorName(selectedTestimony)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedTestimony && (
              <Box>
                <Typography variant="body1" paragraph>
                  {selectedTestimony.content}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Informations de contact :
                  </Typography>
                  {selectedTestimony.phone && (
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PhoneIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">{selectedTestimony.phone}</Typography>
                    </Box>
                  )}
                  {selectedTestimony.email && (
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <EmailIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">{selectedTestimony.email}</Typography>
                    </Box>
                  )}
                  {selectedTestimony.network?.nom && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <GroupIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2">Réseau : {selectedTestimony.network.nom}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>


      {/* Snackbar feedback */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={hideNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestimoniesCulte;
