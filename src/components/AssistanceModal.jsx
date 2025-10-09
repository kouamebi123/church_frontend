import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { TYPES_CULTE_OPTIONS } from '@constants/enums';
import i18nService from '@services/i18nService';
import assistanceService from '@services/assistanceService';
import previsionnelService from '@services/previsionnelService';
import logger from '@utils/logger';


const AssistanceModal = ({ 
  open, 
  onClose, 
  networkData, 
  onSave, 
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type_culte: '',
    groupes_assistance: {},
    invites: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previsionnel, setPrevisionnel] = useState(null);
  const [totalPresents, setTotalPresents] = useState(0);

  // Charger les données du réseau et des groupes
  useEffect(() => {
    if (open && networkData?.grs && Array.isArray(networkData.grs)) {
      const groupesAssistance = {};
      networkData.grs.forEach(groupe => {
        const effectifActuel = groupe.members?.length || 0;
        const nom = groupe.nom || `GR ${groupe.responsable1?.username?.split(' ')[0] || 'Sans nom'}${groupe.responsable2?.username ? ` & ${groupe.responsable2?.username?.split(' ')[0]}` : ''}`;
        
        groupesAssistance[groupe.id] = {
          id: groupe.id,
          nom: nom,
          effectif_actuel: effectifActuel,
          nombre_presents: effectifActuel // Valeur par défaut = effectif actuel
        };
      });
      
      setFormData(prev => ({
        ...prev,
        groupes_assistance: groupesAssistance
      }));
    }
  }, [open, networkData]);



  // Charger le prévisionnel correspondant s'il existe
  useEffect(() => {
    const loadPrevisionnel = async () => {
      if (formData.date && formData.type_culte && networkData?.reseau?.id) {
        try {
          const response = await previsionnelService.getStats({
            network_id: networkData.reseau.id,
            date_from: formData.date,
            date_to: formData.date,
            type_culte: formData.type_culte
          });
          
          if (response.data && response.data.details && response.data.details.length > 0) {
            setPrevisionnel(response.data.details[0]);
          } else {
            setPrevisionnel(null);
          }
        } catch (error) {
          // logger.error('Erreur lors du chargement du prévisionnel:', error);
          setPrevisionnel(null);
        }
      }
    };

    loadPrevisionnel();
  }, [formData.date, formData.type_culte, networkData?.reseau?.id]);

  // Calculer le total des présents
  useEffect(() => {
    const total = Object.values(formData.groupes_assistance).reduce(
      (sum, groupe) => sum + (groupe.nombre_presents || 0), 0
    );
    setTotalPresents(total);
  }, [formData.groupes_assistance]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGroupeChange = (groupeId, field, value) => {
    setFormData(prev => ({
      ...prev,
      groupes_assistance: {
        ...prev.groupes_assistance,
        [groupeId]: {
          ...prev.groupes_assistance[groupeId],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.date || !formData.type_culte) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      if (totalPresents === 0) {
        throw new Error('Veuillez saisir au moins un présent');
      }

      const payload = {
        date: new Date(formData.date).toISOString(),
        type_culte: formData.type_culte,
        total_presents: totalPresents + (formData.invites || 0),
        invites: formData.invites || 0,
        network_id: networkData.reseau.id,
        church_id: networkData.reseau.church_id || networkData.reseau.eglise_id,
        groupes_assistance: Object.values(formData.groupes_assistance).map(groupe => ({
          group_id: groupe.id,
          effectif_actuel: groupe.effectif_actuel,
          nombre_presents: groupe.nombre_presents
        }))
      };

      // Appeler onSave avec les données au lieu de créer directement
      onSave(payload);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Ne pas réinitialiser les groupes, juste fermer le modal
    setError(null);
    setPrevisionnel(null);
    onClose();
  };

  // Calculer l'écart avec le prévisionnel
  const ecart = previsionnel ? totalPresents - previsionnel.previsionnel : null;

  // Filtrer les types de culte (exclure "Tous" qui est pour les filtres)
  const cultesOptions = TYPES_CULTE_OPTIONS.filter(option => option.value !== 'Tous');

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          height: '90vh',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(102, 45, 145, 0.15)',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(102, 45, 145, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '2px solid rgba(102, 45, 145, 0.1)',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)'
      }}>
        <Typography 
          variant="h5" 
          component="div"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5
          }}
        >
          {i18nService.t('assistance.form.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {i18nService.t('assistance.form.subtitle')} - {networkData?.reseau?.nom}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Box component="form" sx={{ mb: 3 }}>
          <Grid container spacing={3}>
            {/* Date du culte */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="assistance-form-date"
                name="date"
                type="date"
                label={i18nService.t('assistance.form.date')}
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200 }}
                autoComplete="off"
              />
            </Grid>

            {/* Type de culte */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                id="assistance-form-type-culte"
                name="type_culte"
                label={i18nService.t('assistance.form.typeCulte')}
                value={formData.type_culte}
                onChange={(e) => handleInputChange('type_culte', e.target.value)}
                sx={{ minWidth: 200 }}
                autoComplete="off"
              >
                {cultesOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Affichage des erreurs */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Section Groupes */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {i18nService.t('assistance.form.groupes')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {i18nService.t('assistance.form.groupesDescription')}
          </Typography>



            <Grid container spacing={2}>
              {Object.values(formData.groupes_assistance).map((groupe) => (
                <Grid item xs={12} sm={6} md={4} key={groupe.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      borderRadius: '16px',
                      border: '2px solid rgba(102, 45, 145, 0.1)',
                      background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                      boxShadow: '0 4px 12px rgba(102, 45, 145, 0.08)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(102, 45, 145, 0.15)',
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {groupe.nom}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {i18nService.t('assistance.form.totalMembres')} : <strong>{groupe.effectif_actuel}</strong>
                      </Typography>
                    </Box>

                    <TextField
                      fullWidth
                      id={`assistance-form-groupe-${groupe.id}`}
                      name={`groupe_${groupe.id}`}
                      type="number"
                      variant="outlined"
                      label={i18nService.t('assistance.form.nombrePresents')}
                      value={groupe.nombre_presents || ''}
                      onChange={(e) => handleGroupeChange(groupe.id, 'nombre_presents', parseInt(e.target.value) || 0)}
                      inputProps={{ min: 0, max: groupe.effectif_actuel }}
                      size="small"
                      autoComplete="off"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section Invités */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {i18nService.t('assistance.form.invites')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {i18nService.t('assistance.form.invitesDescription')}
          </Typography>
          
          <TextField
            fullWidth
            id="assistance-form-invites"
            name="invites"
            type="number"
            label={i18nService.t('assistance.form.nombreInvites')}
            value={formData.invites || 0}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              invites: parseInt(e.target.value) || 0 
            }))}
            inputProps={{ min: 0 }}
            sx={{ maxWidth: 300 }}
            autoComplete="off"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Comparaison avec prévisionnel */}
        {previsionnel && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {i18nService.t('assistance.form.comparisonTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {i18nService.t('assistance.form.comparisonDescription')}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 2.5, 
                    textAlign: 'center',
                    borderRadius: '16px',
                    border: '2px solid rgba(102, 45, 145, 0.2)',
                    background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                    boxShadow: '0 4px 12px rgba(102, 45, 145, 0.08)'
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {i18nService.t('assistance.form.previsionnel')}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {previsionnel.previsionnel}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 2.5, 
                    textAlign: 'center',
                    borderRadius: '16px',
                    border: '2px solid rgba(16, 185, 129, 0.2)',
                    background: 'linear-gradient(145deg, #FFFFFF 0%, #ECFDF5 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)'
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {i18nService.t('assistance.form.presents')}
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {totalPresents}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 2.5, 
                    textAlign: 'center',
                    borderRadius: '16px',
                    border: '2px solid rgba(59, 130, 246, 0.2)',
                    background: 'linear-gradient(145deg, #FFFFFF 0%, #EFF6FF 100%)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)'
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {i18nService.t('assistance.form.ecart')}
                  </Typography>
                  <Chip
                    label={ecart >= 0 ? `+${ecart}` : ecart}
                    color={ecart >= 0 ? 'success' : 'error'}
                    size="medium"
                  />
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Total présents + invités à gauche */}
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {i18nService.t('assistance.form.totalPresents')} : <strong>{totalPresents + (formData.invites || 0)}</strong>
          {formData.invites > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              ({totalPresents} membres + {formData.invites} invités)
            </Typography>
          )}
        </Typography>

        {/* Boutons à droite */}
        <Box>
          <Button onClick={handleClose} disabled={isLoading} sx={{ mr: 1 }}>
            {i18nService.t('common.actions.cancel')}
          </Button>
                  <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || totalPresents === 0}
        >
          {isLoading ? i18nService.t('common.actions.loading') : i18nService.t('assistance.form.save')}
        </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AssistanceModal;
