import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  Chip
} from '@mui/material';

import { TYPES_CULTE_OPTIONS } from '@constants/enums';
import i18nService from '@services/i18nService';

const PrevisionnelModal = ({ 
  open, 
  onClose, 
  onSave, 
  networkData, 
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    date: new Date(),
    type_culte: '',
    groupes_previsions: {}
  });

  const [totalPrevisionnel, setTotalPrevisionnel] = useState(0);
  const [errors, setErrors] = useState({});

  // Initialiser les prévisions des groupes quand les données du réseau changent
  useEffect(() => {
    if (networkData?.grs && Array.isArray(networkData.grs)) {
      const groupesPrevisions = {};
      networkData.grs.forEach(gr => {
        const effectifActuel = gr.members?.length || 0;
        const nom = gr.nom || `GR ${gr.responsable1?.username?.split(' ')[0] || 'Sans nom'}${gr.responsable2?.username ? ` & ${gr.responsable2?.username?.split(' ')[0]}` : ''}`;
        
        groupesPrevisions[gr.id] = {
          id: gr.id,
          nom: nom,
          effectif_actuel: effectifActuel,
          valeur_previsionnelle: effectifActuel // Valeur par défaut = effectif actuel
        };
      });
      
      setFormData(prev => ({
        ...prev,
        groupes_previsions: groupesPrevisions
      }));
    }
  }, [networkData]);



  // Calculer le total prévisionnel en temps réel
  useEffect(() => {
    const total = Object.values(formData.groupes_previsions).reduce((sum, groupe) => {
      return sum + (parseInt(groupe.valeur_previsionnelle) || 0);
    }, 0);
    setTotalPrevisionnel(total);
  }, [formData.groupes_previsions]);

  const handleGroupPrevisionChange = (groupId, value) => {
    const numericValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      groupes_previsions: {
        ...prev.groupes_previsions,
        [groupId]: {
          ...prev.groupes_previsions[groupId],
          valeur_previsionnelle: numericValue
        }
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) {
      newErrors.date = i18nService.t('errors.validation.dateRequired');
    }
    
    if (!formData.type_culte) {
      newErrors.type_culte = i18nService.t('errors.validation.typeCulteRequired');
    }
    
    // Vérifier qu'au moins un groupe a une prévision > 0
    const hasValidPrevision = Object.values(formData.groupes_previsions).some(
      groupe => (parseInt(groupe.valeur_previsionnelle) || 0) > 0
    );
    
    if (!hasValidPrevision) {
      newErrors.previsions = i18nService.t('previsionnel.errors.noPrevision');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const totalAvecInvites = totalPrevisionnel + (formData.invites || 0);

    const payload = {
      date: formData.date.toISOString(),
      type_culte: formData.type_culte,
      total_prevu: totalAvecInvites,
      invites: formData.invites || 0,
      network_id: networkData.reseau.id,
      church_id: networkData.reseau.church_id || networkData.reseau.eglise_id,
      groupes_previsions: Object.values(formData.groupes_previsions).map(groupe => ({
        group_id: groupe.id,
        effectif_actuel: groupe.effectif_actuel,
        valeur_previsionnelle: groupe.valeur_previsionnelle
      }))
    };

    onSave(payload);
  };

  // Fonction pour réinitialiser le formulaire après sauvegarde
  const resetForm = () => {
    setFormData(prev => ({
      ...prev,
      date: new Date(),
      type_culte: '',
      invites: 0,
      // Réinitialiser les valeurs prévisionnelles mais garder les groupes
      groupes_previsions: Object.keys(prev.groupes_previsions).reduce((acc, groupId) => {
        acc[groupId] = {
          ...prev.groupes_previsions[groupId],
          valeur_previsionnelle: prev.groupes_previsions[groupId].effectif_actuel
        };
        return acc;
      }, {})
    }));
    setErrors({});
  };

  const handleClose = () => {
    // Ne pas réinitialiser les groupes, juste fermer le modal
    setErrors({});
    onClose();
  };

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
            {i18nService.t('previsionnel.modal.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {i18nService.t('previsionnel.modal.subtitle')} - {networkData?.reseau?.nom}
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Box component="form" sx={{ mb: 3 }}>
            <Grid container spacing={3}>
              {/* Date du prévisionnel */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="previsionnel-form-date"
                  name="date"
                  type="date"
                  label={i18nService.t('previsionnel.form.date')}
                  value={formData.date ? formData.date.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                  error={!!errors.date}
                  helperText={errors.date}
                  required
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
                  id="previsionnel-form-type-culte"
                  name="type_culte"
                  label={i18nService.t('previsionnel.form.typeCulte')}
                  value={formData.type_culte}
                  onChange={(e) => setFormData(prev => ({ ...prev, type_culte: e.target.value }))}
                  error={!!errors.type_culte}
                  helperText={errors.type_culte}
                  required
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

          {/* Affichage des erreurs générales */}
          {errors.previsions && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errors.previsions}
            </Alert>
          )}

          {/* Section Groupes */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {i18nService.t('previsionnel.form.groupes')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {i18nService.t('previsionnel.form.groupesDescription')}
            </Typography>



            <Grid container spacing={2}>
              {Object.values(formData.groupes_previsions).map((groupe) => (
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
                           {i18nService.t('previsionnel.form.totalMembres')} : <strong>{groupe.effectif_actuel}</strong>
                        </Typography>
                      </Box>

                      <TextField
                        fullWidth
                        id={`previsionnel-form-groupe-${groupe.id}`}
                        name={`groupe_${groupe.id}`}
                        type="number"
                        variant="outlined"
                        label={i18nService.t('previsionnel.form.valeurPrevisionnelle')}
                        value={groupe.valeur_previsionnelle}
                        onChange={(e) => handleGroupPrevisionChange(groupe.id, e.target.value)}
                        inputProps={{ min: 0 }}
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
              {i18nService.t('previsionnel.form.invites')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {i18nService.t('previsionnel.form.invitesDescription')}
            </Typography>
            
            <TextField
              fullWidth
              id="previsionnel-form-invites"
              name="invites"
              type="number"
              label={i18nService.t('previsionnel.form.nombreInvites')}
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
        </DialogContent>

        <DialogActions sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Total prévisionnel à gauche */}
              
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {i18nService.t('previsionnel.form.totalPrevisionnel')} : <strong>{totalPrevisionnel + (formData.invites || 0)}</strong>
            </Typography>
          

          {/* Boutons à droite */}
          <Box>
            <Button onClick={handleClose} disabled={isLoading} sx={{ mr: 1 }}>
              {i18nService.t('common.actions.cancel')}
            </Button>
                    <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || (totalPrevisionnel + (formData.invites || 0)) === 0}
        >
          {isLoading ? i18nService.t('common.actions.loading') : i18nService.t('previsionnel.form.save')}
        </Button>
          </Box>
        </DialogActions>
      </Dialog>
    );
  };

export default PrevisionnelModal;
