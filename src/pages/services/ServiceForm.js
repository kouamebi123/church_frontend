import React, { useState, useEffect } from 'react';
import i18nService from '../../services/i18nService';
import { handleApiError } from '../../utils/errorHandler';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  MenuItem,
  Typography
} from '@mui/material';
import SuccessDialog from '../../components/layout/SuccessDialog';
import { format } from 'date-fns';
import ErrorMessage from '../../components/ErrorMessage';
import { TYPES_CULTE_OPTIONS } from '../../constants/enums';
import { apiService } from '../../services/apiService';
import { useNotification } from '../../hooks/useNotification';
import { useSelectedChurch } from '../../hooks/useSelectedChurch';
import { useAuth } from '../../hooks/useAuth';
import AccessControl from '../../components/AccessControl';

const validationSchema = Yup.object({
  culte: Yup.string().required('Le type de culte est requis'),
  orateur: Yup.string().required('L\'orateur est requis'),
  date: Yup.date().required('La date est requise'),
  total_adultes: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre d\'adultes est requis'),
  total_enfants: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre d\'enfants est requis'),
  total_chantres: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre de chantres est requis'),
  total_protocoles: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre de protocoles est requis'),
  total_multimedia: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre de multimedia est requis'),
  total_respo_ecodim: Yup.number().min(0, 'Le nombre doit être positif').required('Le responsable ECODIM est requis'),
  total_animateurs_ecodim: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre d\'animateurs ECODIM est requis'),
  total_enfants_ecodim: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre d\'enfants ECODIM est requis'),
  superviseur: Yup.string().required('Le superviseur est requis'),
  invitationYoutube: Yup.number().min(0, 'Le nombre doit être positif'),
  invitationTiktok: Yup.number().min(0, 'Le nombre doit être positif'),
  invitationInstagram: Yup.number().min(0, 'Le nombre doit être positif'),
  invitationPhysique: Yup.number().min(0, 'Le nombre doit être positif')
});

const ServiceForm = () => {
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  // navigate supprimé car non utilisé
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [superviseurs, setSuperviseurs] = useState([]);
  const { selectedChurch } = useSelectedChurch();
  const { user } = useAuth();

  const {
    showError
  } = useNotification();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Récupérer les superviseurs
        const superviseursResponse = await apiService.users.getAll({ role: 'SUPERVISEUR' });
        setSuperviseurs(superviseursResponse.data?.data || superviseursResponse.data || []);

        setLoading(false);
      } catch (err) {
        const processedError = handleApiError(err, i18nService.t('errors.api.loadUsers'));
            ;
        setError(err.response?.data?.message || err.message || i18nService.t('errors.api.loadUsers'));
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formik = useFormik({
    initialValues: {
      culte: '',
      orateur: '',
      date: new Date(),
      total_adultes: '',
      total_enfants: '',
      total_chantres: '',
      total_protocoles: '',
      total_multimedia: '',
      total_respo_ecodim: '',
      total_animateurs_ecodim: '',
      total_enfants_ecodim: '',
      superviseur: null,
      invitationYoutube: 0,
      invitationTiktok: 0,
      invitationInstagram: 0,
      invitationPhysique: 0
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Vérifier que l'église est sélectionnée
        if (!selectedChurch?.id) {
          showError(i18nService.t('errors.api.selectChurch'));
          return;
        }

        // Vérifier que l'utilisateur est connecté
        if (!user?.id) {
          showError('Utilisateur non connecté');
          return;
        }

        // Convertir les valeurs numériques en nombres et adapter au format backend
        const formattedValues = {
          date: values.date,
          culte: values.culte,
          orateur: values.orateur,
          eglise_id: selectedChurch.id,
          nombre_present: Number(values.total_adultes) + Number(values.total_enfants),
          responsable_id: values.superviseur || null,
          // Champs supplémentaires pour le frontend
          total_adultes: Number(values.total_adultes),
          total_enfants: Number(values.total_enfants),
          total_chantres: Number(values.total_chantres),
          total_protocoles: Number(values.total_protocoles),
          total_multimedia: Number(values.total_multimedia),
          total_respo_ecodim: Number(values.total_respo_ecodim),
          total_animateurs_ecodim: Number(values.total_animateurs_ecodim),
          total_enfants_ecodim: Number(values.total_enfants_ecodim),
          collecteur_culte_id: user?.id,
          superviseur_id: values.superviseur,
          invitationYoutube: Number(values.invitationYoutube),
          invitationTiktok: Number(values.invitationTiktok),
          invitationInstagram: Number(values.invitationInstagram),
          invitationPhysique: Number(values.invitationPhysique)
        };

        // Debug des valeurs formatées - Supprimé pour la production

        await apiService.services.create(formattedValues);
        setSuccessDialogOpen(true);
      } catch (error) {
        // Gestion des erreurs spécifiques de l'API
        if (error.response?.status === 400) {
          showError(i18nService.t('errors.api.invalidData'));
        } else if (error.response?.status === 500) {
          showError(i18nService.t('errors.api.serverError'));
        } else if (error.response?.data?.message) {
          showError(error.response.data.message);
        } else {
          showError(error.message || i18nService.t('errors.api.createService'));
        }
      }
    }
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <ErrorMessage error={error} title={i18nService.t('errors.loading')} />;
  
  // Vérifier qu'une église est sélectionnée
  if (!selectedChurch?.id) {
    return (
      <Paper data-aos="fade-up" elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {i18nService.t('home.noChurchSelected')}
          </Typography>
          <Typography variant="body1">
            {i18nService.t('home.selectChurchForService')}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <AccessControl allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'COLLECTEUR_CULTE']}>
      <Paper data-aos="fade-up" elevation={3} sx={{ p: 4 }}>
        <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              select
              id="service-form-culte"
              name="culte"
              label={i18nService.t('services.list.typeCulte')}
              value={formik.values.culte}
              onChange={formik.handleChange}
              error={formik.touched.culte && Boolean(formik.errors.culte)}
              helperText={formik.touched.culte && formik.errors.culte}
              autoComplete="off"
            >
              {TYPES_CULTE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              type="date"
              id="service-form-date"
              name="date"
              label={i18nService.t('services.list.dateCulte')}
              value={format(formik.values.date, 'yyyy-MM-dd')}
              onChange={(e) => formik.setFieldValue('date', new Date(e.target.value))}
              error={formik.touched.date && Boolean(formik.errors.date)}
              helperText={formik.touched.date && formik.errors.date}
              InputLabelProps={{ shrink: true }}
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              id="service-form-orateur"
              name="orateur"
              label={i18nService.t('services.list.orateur')}
              value={formik.values.orateur}
              onChange={formik.handleChange}
              error={formik.touched.orateur && Boolean(formik.errors.orateur)}
              helperText={formik.touched.orateur && formik.errors.orateur}
              autoComplete="name"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              id="service-form-total-adultes"
              name="total_adultes"
              label={i18nService.t('services.list.nombreAdultes')}
              type="number"
              value={formik.values.total_adultes}
              onChange={formik.handleChange}
              error={formik.touched.total_adultes && Boolean(formik.errors.total_adultes)}
              helperText={formik.touched.total_adultes && formik.errors.total_adultes}
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              id="service-form-total-enfants"
              name="total_enfants"
              label={i18nService.t('services.list.nombreEnfants')}
              type="number"
              value={formik.values.total_enfants}
              onChange={formik.handleChange}
              error={formik.touched.total_enfants && Boolean(formik.errors.total_enfants)}
              helperText={formik.touched.total_enfants && formik.errors.total_enfants}
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              id="service-form-total-chantres"
              name="total_chantres"
              label={i18nService.t('services.list.nombreChantres')}
              type="number"
              value={formik.values.total_chantres}
              onChange={formik.handleChange}
              error={formik.touched.total_chantres && Boolean(formik.errors.total_chantres)}
              helperText={formik.touched.total_chantres && formik.errors.total_chantres}
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              id="service-form-total-protocoles"
              name="total_protocoles"
              label={i18nService.t('services.list.nombreProtocoles')}
              type="number"
              value={formik.values.total_protocoles}
              onChange={formik.handleChange}
              error={formik.touched.total_protocoles && Boolean(formik.errors.total_protocoles)}
              helperText={formik.touched.total_protocoles && formik.errors.total_protocoles}
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              id="service-form-total-multimedia"
              name="total_multimedia"
              label={i18nService.t('services.list.nombreMultimedia')}
              type="number"
              value={formik.values.total_multimedia}
              onChange={formik.handleChange}
              error={formik.touched.total_multimedia && Boolean(formik.errors.total_multimedia)}
              helperText={formik.touched.total_multimedia && formik.errors.total_multimedia}
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              id="service-form-total-respo-ecodim"
              name="total_respo_ecodim"
              label={i18nService.t('services.list.responsableEcodim')}
              type="number"
              value={formik.values.total_respo_ecodim}
              onChange={formik.handleChange}
              error={formik.touched.total_respo_ecodim && Boolean(formik.errors.total_respo_ecodim)}
              helperText={formik.touched.total_respo_ecodim && formik.errors.total_respo_ecodim}
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              id="service-form-total-animateurs-ecodim"
              name="total_animateurs_ecodim"
              label={i18nService.t('services.list.nombreAnimateurs')}
              type="number"
              value={formik.values.total_animateurs_ecodim}
              onChange={formik.handleChange}
              error={
                formik.touched.total_animateurs_ecodim &&
                Boolean(formik.errors.total_animateurs_ecodim)
              }
              helperText={
                formik.touched.total_animateurs_ecodim && formik.errors.total_animateurs_ecodim
              }
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              id="service-form-total-enfants-ecodim"
              name="total_enfants_ecodim"
              label={`${i18nService.t('services.list.nombreEnfants')} ${i18nService.t('services.list.enfEcodim')}`}
              type="number"
              value={formik.values.total_enfants_ecodim}
              onChange={formik.handleChange}
              error={
                formik.touched.total_enfants_ecodim &&
                Boolean(formik.errors.total_enfants_ecodim)
              }
              helperText={
                formik.touched.total_enfants_ecodim && formik.errors.total_enfants_ecodim
              }
              autoComplete="off"
            />
          </Grid>


          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              select
              id="service-form-superviseur"
              name="superviseur"
              label={i18nService.t('services.form.supervisor')}
              value={formik.values.superviseur || ''}
              onChange={formik.handleChange}
              error={formik.touched.superviseur && Boolean(formik.errors.superviseur)}
              helperText={formik.touched.superviseur && formik.errors.superviseur}
              required
              autoComplete="off"
            >
              <MenuItem value="">{i18nService.t('services.list.selectSuperviseur')}</MenuItem>
              {superviseurs && superviseurs.length > 0 ? (
                superviseurs.map(superviseur => (
                  <MenuItem key={superviseur._id || superviseur.id} value={superviseur._id || superviseur.id}>
                    {superviseur.username || superviseur.pseudo || i18nService.t('common_text.unknownName')}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>{i18nService.t('services.list.noSuperviseur')}</MenuItem>
              )}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              id="service-form-invitation-youtube"
              name="invitationYoutube"
              label={i18nService.t('services.list.invitationsYoutube')}
              type="number"
              value={formik.values.invitationYoutube}
              onChange={formik.handleChange}
              error={formik.touched.invitationYoutube && Boolean(formik.errors.invitationYoutube)}
              helperText={formik.touched.invitationYoutube && formik.errors.invitationYoutube}
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              id="service-form-invitation-tiktok"
              name="invitationTiktok"
              label={i18nService.t('services.list.invitationsTiktok')}
              type="number"
              value={formik.values.invitationTiktok}
              onChange={formik.handleChange}
              error={formik.touched.invitationTiktok && Boolean(formik.errors.invitationTiktok)}
              helperText={formik.touched.invitationTiktok && formik.errors.invitationTiktok}
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              id="service-form-invitation-instagram"
              name="invitationInstagram"
              label={i18nService.t('services.list.invitationsInstagram')}
              type="number"
              value={formik.values.invitationInstagram}
              onChange={formik.handleChange}
              error={formik.touched.invitationInstagram && Boolean(formik.errors.invitationInstagram)}
              helperText={formik.touched.invitationInstagram && formik.errors.invitationInstagram}
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              id="service-form-invitation-physique"
              name="invitationPhysique"
              label={i18nService.t('services.list.invitationsPhysiques')}
              type="number"
              value={formik.values.invitationPhysique}
              onChange={formik.handleChange}
              error={formik.touched.invitationPhysique && Boolean(formik.errors.invitationPhysique)}
              helperText={formik.touched.invitationPhysique && formik.errors.invitationPhysique}
              autoComplete="off"
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 1, right: 0 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => formik.resetForm()}
              >
                {i18nService.t('common.actions.reset')}
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {i18nService.t('common.actions.save')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
      {/* Dialog de succès après création */}
      <SuccessDialog
        open={successDialogOpen}
        onClose={() => { setSuccessDialogOpen(false); 
          formik.resetForm();
        }}
        title={i18nService.t('success.success')}
        content={i18nService.t('success.serviceCreated')}
      />

      </Paper>
    </AccessControl>
  );
};

export default ServiceForm;
