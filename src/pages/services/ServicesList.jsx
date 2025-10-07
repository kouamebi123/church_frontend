import React, { useState, useEffect, useMemo } from 'react';
import i18nService from '@services/i18nService';
import { handleApiError } from '@utils/errorHandler';
import { format } from 'date-fns';
import fr from 'date-fns/locale/fr';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Box,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  MenuItem as MuiMenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { TYPES_CULTE_OPTIONS } from '@constants/enums';
import ErrorMessage from '@components/ErrorMessage';
import DeleteConfirmDialog from '@components/DeleteConfirmDialog';
import Loading from '@components/Loading';
import { useServices } from '@hooks/useApi';
import { useNotification } from '@hooks/useNotification';
import { apiService } from '@services/apiService';
import { usePermissions } from '@hooks/usePermissions';
import { useSelectedChurch } from '@hooks/useSelectedChurch';
import AccessControl from '@components/AccessControl';


const validationSchema = Yup.object({
  culte: Yup.string().required('Le type de culte est requis'),
  orateur: Yup.string().required('L\'orateur est requis'),
  date: Yup.date().required('La date est requise'),
  total_adultes: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre d\'adultes est requis'),
  total_enfants: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre d\'enfants est requis'),
  total_chantres: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre de chantres est requis'),
  total_protocoles: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre de protocoles est requis'),
  total_multimedia: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre de multimedia est requis'),
  total_respo_ecodim: Yup.string().required('Le responsable ECODIM est requis'),
  total_animateurs_ecodim: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre d\'animateurs ECODIM est requis'),
  total_enfants_ecodim: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre d\'enfants ECODIM est requis'),
  superviseur: Yup.string().required('Le superviseur est requis')
});

const ServicesList = () => {
  const { canUpdateServices, canDeleteServices } = usePermissions();
  const { selectedChurch } = useSelectedChurch();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [superviseurs, setSuperviseurs] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [filter, setFilter] = useState({
    type: '',
    date: '',
    collecteur: '',
    superviseur: ''
  });

  const {
    services: allServices,
    loading,
    error,
    fetchServices,
    // createService supprimé car non utilisé
    updateService,
    deleteService
  } = useServices();

  const {
    notification,
    showSuccess,
    showError,
    hideNotification
  } = useNotification();

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const loadSuperviseurs = async () => {
    try {
      const superviseursRes = await apiService.users.getAll({ role: 'SUPERVISEUR' });
      const superviseursData = superviseursRes.data?.data || superviseursRes.data || [];
      
      setSuperviseurs(superviseursData.map(user => ({
        id: user.id || user._id,
        username: user.username || user.pseudo || i18nService.t('common_text.unknownName'),
        pseudo: user.pseudo || user.username || i18nService.t('common_text.unknownName')
      })));
    } catch (err) {
      const processedError = handleApiError(err, i18nService.t('errors.api.loadUsers'));
      showError(i18nService.t('errors.api.loadUsers'));
    }
  };

  useEffect(() => {
    fetchServices();
    loadSuperviseurs();
  }, [fetchServices]);

  // Filtrer les services par église sélectionnée
  const services = useMemo(() => {
    if (!selectedChurch?.id || !allServices || allServices.length === 0) {
      return [];
    }

    const filteredServices = allServices.filter(service => {
      const serviceChurchId = service.eglise?.id || service.eglise_id;
      const matches = serviceChurchId === selectedChurch.id;
      
      if (!matches) {
                    // Service filtré par église - Supprimé pour la production
      }
      
      return matches;
    });
    
            // Debug du filtrage - Supprimé pour la production
    return filteredServices;
  }, [allServices, selectedChurch]);

  // Log des services pour déboguer
  useEffect(() => {
    if (services.length > 0) {
          // Debug des services - Supprimé pour la production
    }
  }, [services]);

  const handleEditService = (service) => {
    // Debug du service - Supprimé pour la production
    
    setEditService(service);
    setEditModalOpen(true);
    
    // Pré-remplir le formulaire avec les données du service
    formik.setValues({
      culte: service.culte || '',
      orateur: service.orateur || '',
      date: service.date || new i18nService.t('common.time.days')().toISOString().split('T')[0],
      total_adultes: service.total_adultes || 0,
      total_enfants: service.total_enfants || 0,
      total_chantres: service.total_chantres || 0,
      total_protocoles: service.total_protocoles || 0,
      total_multimedia: service.total_multimedia || 0,
      total_respo_ecodim: service.total_respo_ecodim || 0,
      total_animateurs_ecodim: service.total_animateurs_ecodim || 0,
      total_enfants_ecodim: service.total_enfants_ecodim || 0,
      superviseur: service.superviseur?.id || service.superviseur?._id || ''
    });
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditService(null);
    // Réinitialiser le formulaire avec des valeurs par défaut cohérentes
    formik.setValues({
      culte: '',
      orateur: '',
      date: new Date().toISOString().split('T')[0],
      total_adultes: 0,
      total_enfants: 0,
      total_chantres: 0,
      total_protocoles: 0,
      total_multimedia: 0,
      total_respo_ecodim: 0,
      total_animateurs_ecodim: 0,
      total_enfants_ecodim: 0,
      superviseur: ''
    });
    formik.setTouched({});
    formik.setErrors({});
  };

  const handleEditSubmit = async (values) => {
    try {
      // Récupérer l'ID du service de manière sécurisée
      const serviceId = editService?.id || editService?._id;
      
      if (!serviceId) {
        showError(i18nService.t('errors.validation.serviceIdNotFound'));
        return;
      }
      
              // Debug de la soumission - Supprimé pour la production
      
      // Nettoyer les valeurs avant envoi
      const cleanedValues = {
        culte: values.culte,
        orateur: values.orateur,
        date: values.date,
        total_adultes: parseInt(values.total_adultes) || 0,
        total_enfants: parseInt(values.total_enfants) || 0,
        total_chantres: parseInt(values.total_chantres) || 0,
        total_protocoles: parseInt(values.total_protocoles) || 0,
        total_multimedia: parseInt(values.total_multimedia) || 0,
        total_respo_ecodim: parseInt(values.total_respo_ecodim) || 0,
        total_animateurs_ecodim: parseInt(values.total_animateurs_ecodim) || 0,
        total_enfants_ecodim: parseInt(values.total_enfants_ecodim) || 0,
        superviseur_id: values.superviseur || null
      };
      
              // Debug des valeurs nettoyées - Supprimé pour la production
      
      await updateService(serviceId, cleanedValues);
      
      // Mettre à jour le service dans la liste
      const updatedServices = services.map(s => {
        const sId = s.id || s._id;
        return sId === serviceId ? { ...s, ...cleanedValues } : s;
      });
      fetchServices(updatedServices);

      handleEditClose();
      showSuccess(i18nService.t('success.serviceUpdated'));
    } catch (error) {
      showError(i18nService.t('errors.api.updateService'));
    }
  };

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
      superviseur: ''
    },
    validationSchema,
    onSubmit: handleEditSubmit
  });

  const handleFilterChange = (event) => {
    setFilter({
      ...filter,
      [event.target.name]: event.target.value
    });
  };

  const filteredServices = services
    .filter(service => {
      if (filter.type && filter.type !== 'Tous' && service.culte !== filter.type) return false;
      if (filter.date) {
        const filterDate = new Date(filter.date);
        const serviceDate = new Date(service.date);
        if (filterDate.getFullYear() !== serviceDate.getFullYear() ||
            filterDate.getMonth() !== serviceDate.getMonth() ||
            filterDate.getDate() !== serviceDate.getDate()) {
          return false;
        }
      }
      if (filter.collecteur && !service.collecteur_culte?.username.toLowerCase().includes(filter.collecteur.toLowerCase())) return false;
      if (filter.superviseur && !service.superviseur?.username.toLowerCase().includes(filter.superviseur.toLowerCase())) return false;
      return true;
    });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDeleteDialog = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteService = async () => {
    if (!serviceToDelete) return;
    
    const serviceId = serviceToDelete?.id || serviceToDelete?._id;
    if (!serviceId) {
      showError(i18nService.t('errors.validation.serviceIdNotFound'));
      return;
    }
    
    try {
      await deleteService(serviceId);
      const updatedServices = services.filter(service => {
        const sId = service.id || service._id;
        return sId !== serviceId;
      });
      fetchServices(updatedServices);
      showSuccess(i18nService.t('success.serviceDeleted'));
    } catch (error) {
      showError(i18nService.t('errors.api.deleteService'));
    } finally {
      handleCloseDeleteDialog();
    }
  };

  if (loading) return <Loading titre={i18nService.t('loading.loadingServices')} />;
  if (error) return <ErrorMessage message={error} />;
  
  // Vérifier si une église est sélectionnée
  if (!selectedChurch?.id) {
    return (
      <Paper 
        data-aos="fade-up" 
        elevation={0}
        sx={{ 
          p: 5,
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(91, 33, 182, 0.1)',
          boxShadow: '0 10px 40px rgba(91, 33, 182, 0.08)'
        }}
      >
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {i18nService.t('home.noChurchSelected')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {i18nService.t('home.selectChurchForServices')}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <AccessControl allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISEUR']}>
      <Paper 
        data-aos="fade-up" 
        elevation={0} 
        sx={{ 
          p: 5,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          border: '1px solid rgba(91, 33, 182, 0.1)',
          boxShadow: '0 10px 40px rgba(91, 33, 182, 0.12)'
        }}
      >
        
        {/* i18nService.t('common.actions.filter') */}
        <Box mb={4}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              mb: 2
            }}
          >
            {i18nService.t('common.actions.filter')}
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              select
              id="services-filter-type"
              name="type"
              label={i18nService.t('services.list.typeCulte')}
              value={filter.type}
              onChange={handleFilterChange}
              sx={{ minWidth: 200, backgroundColor: '#fdfdfd' }}
              autoComplete="off"
            >
              {TYPES_CULTE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              id="services-filter-date"
              name="date"
              label={i18nService.t('common.time.days')}
              value={filter.date}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200, backgroundColor: '#fdfdfd' }}
              autoComplete="off"
            />
            <TextField
              id="services-filter-collecteur"
              name="collecteur"
              label={i18nService.t('services.list.collecteur')}
              value={filter.collecteur}
              onChange={handleFilterChange}
              sx={{ minWidth: 200, backgroundColor: '#fdfdfd' }}
              autoComplete="off"
            />
            <TextField
              id="services-filter-superviseur"
              name="superviseur"
              label={i18nService.t('services.list.superviseur')}
              value={filter.superviseur}
              onChange={handleFilterChange}
              sx={{ minWidth: 200, backgroundColor: '#fdfdfd' }}
              autoComplete="off"
            />
          </Box>
        </Box>

        {/* Tableau */}
        <TableContainer component={Paper} sx={{ backgroundColor: 'primary.light', maxHeight: '80vh', overflow: 'auto' }}>
          <Table sx={{ backgroundColor: '#fff' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('services.list.typeCulte')}</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('services.list.orateur')}</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('common.time.days')}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('services.list.adultes')}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('services.list.enfants')}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('services.list.chantres')}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('services.list.protocoles')}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('services.list.multimedia')}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('services.list.respEcodim')}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('services.list.animEcodim')}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('services.list.enfEcodim')}</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('services.list.collecteur')}</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('services.list.superviseur')}</TableCell>
                                  <TableCell align="center" sx={{ fontWeight: 700, color: 'white', minWidth: 120 }}>{i18nService.t('common.actions.title')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ backgroundColor: 'white' }}>
              {filteredServices
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((service) => {
                  const serviceId = service.id || service._id;
                  return (
                    <TableRow
                      key={serviceId}
                      hover
                      sx={{
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.03)'
                          }
                      }}
                    >
                    <TableCell>{service.culte}</TableCell>
                    <TableCell>{service.orateur}</TableCell>
                    <TableCell>
                      {format(new Date(service.date), 'dd MMMM yyyy', {
                        locale: fr
                      })}
                    </TableCell>
                    <TableCell align="right">{service.total_adultes || 0}</TableCell>
                    <TableCell align="right">{service.total_enfants || 0}</TableCell>
                    <TableCell align="right">{service.total_chantres || 0}</TableCell>
                    <TableCell align="right">{service.total_protocoles || 0}</TableCell>
                    <TableCell align="right">{service.total_multimedia || 0}</TableCell>
                    <TableCell align="right">{service.total_respo_ecodim || 0}</TableCell>
                    <TableCell align="right">{service.total_animateurs_ecodim || 0}</TableCell>
                    <TableCell align="right">{service.total_enfants_ecodim || 0}</TableCell>
                    <TableCell>{service.collecteur_culte ? service.collecteur_culte.username : ''}</TableCell>
                    <TableCell>{service.superviseur ? service.superviseur.username : ''}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditService(service)}
                        disabled={!canUpdateServices}
                        title={!canUpdateServices ? i18nService.t('errors.adminOnlyRead') : ""}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleOpenDeleteDialog(service)}
                        disabled={!canDeleteServices}
                        title={!canDeleteServices ? i18nService.t('errors.adminOnlyRead') : ""}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
                })}
              {filteredServices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={14} align="center">
                    {i18nService.t('services.list.noServices')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modal de modification */}
        <Dialog 
          open={editModalOpen} 
          onClose={handleEditClose} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(91, 33, 182, 0.15)',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(91, 33, 182, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {i18nService.t('services.list.editService')}
          </DialogTitle>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  id="services-list-edit-culte"
                  name="culte"
                  label={i18nService.t('services.list.typeCulte')}
                  value={formik.values.culte}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.culte && Boolean(formik.errors.culte)}
                  helperText={formik.touched.culte && formik.errors.culte}
                  autoComplete="off"
                />
                <TextField
                  fullWidth
                  id="services-list-edit-orateur"
                  name="orateur"
                  label={i18nService.t('services.list.orateur')}
                  value={formik.values.orateur}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.orateur && Boolean(formik.errors.orateur)}
                  helperText={formik.touched.orateur && formik.errors.orateur}
                  autoComplete="name"
                />
                <TextField
                  fullWidth
                  type="date"
                  id="services-list-edit-date"
                  name="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                  InputLabelProps={{ shrink: true }}
                  autoComplete="off"
                />
                <TextField
                  fullWidth
                  id="services-list-edit-total-adultes"
                  name="total_adultes"
                  label={`Nombre d'${i18nService.t('services.list.adultes')}`}
                  type="number"
                  value={formik.values.total_adultes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_adultes && Boolean(formik.errors.total_adultes)}
                  helperText={formik.touched.total_adultes && formik.errors.total_adultes}
                  autoComplete="off"
                />
                <TextField
                  fullWidth
                  id="services-list-edit-total-enfants"
                  name="total_enfants"
                  label={`Nombre d'${i18nService.t('services.list.enfants')}`}
                  type="number"
                  value={formik.values.total_enfants}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_enfants && Boolean(formik.errors.total_enfants)}
                  helperText={formik.touched.total_enfants && formik.errors.total_enfants}
                  autoComplete="off"
                />
                <TextField
                  fullWidth
                  id="services-list-edit-total-chantres"
                  name="total_chantres"
                  label={`Nombre de ${i18nService.t('services.list.chantres')}`}
                  type="number"
                  value={formik.values.total_chantres}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_chantres && Boolean(formik.errors.total_chantres)}
                  helperText={formik.touched.total_chantres && formik.errors.total_chantres}
                  autoComplete="off"
                />
                <TextField
                  fullWidth
                  id="services-list-edit-total-protocoles"
                  name="total_protocoles"
                  label={`Nombre de ${i18nService.t('services.list.protocoles')}`}
                  type="number"
                  value={formik.values.total_protocoles}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_protocoles && Boolean(formik.errors.total_protocoles)}
                  helperText={formik.touched.total_protocoles && formik.errors.total_protocoles}
                  autoComplete="off"
                />
                <TextField
                  fullWidth
                  id="services-list-edit-total-multimedia"
                  name="total_multimedia"
                  label={`Nombre ${i18nService.t('services.list.multimedia')}`}
                  type="number"
                  value={formik.values.total_multimedia}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_multimedia && Boolean(formik.errors.total_multimedia)}
                  helperText={formik.touched.total_multimedia && formik.errors.total_multimedia}
                  autoComplete="off"
                />
                <TextField
                  fullWidth
                  id="services-list-edit-total-respo-ecodim"
                  name="total_respo_ecodim"
                  label={`Responsable ${i18nService.t('services.list.respEcodim')}`}
                  value={formik.values.total_respo_ecodim}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_respo_ecodim && Boolean(formik.errors.total_respo_ecodim)}
                  helperText={formik.touched.total_respo_ecodim && formik.errors.total_respo_ecodim}
                  autoComplete="name"
                />
                <TextField
                  fullWidth
                  id="services-list-edit-total-animateurs-ecodim"
                  name="total_animateurs_ecodim"
                  label={`Nombre d'${i18nService.t('services.list.animEcodim')}`}
                  type="number"
                  value={formik.values.total_animateurs_ecodim}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_animateurs_ecodim && Boolean(formik.errors.total_animateurs_ecodim)}
                  helperText={formik.touched.total_animateurs_ecodim && formik.errors.total_animateurs_ecodim}
                  autoComplete="off"
                />
                <TextField
                  fullWidth
                  id="services-list-edit-total-enfants-ecodim"
                  name="total_enfants_ecodim"
                  label={`Nombre d'${i18nService.t('services.list.enfants')} ${i18nService.t('services.list.enfEcodim')}`}
                  type="number"
                  value={formik.values.total_enfants_ecodim}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_enfants_ecodim && Boolean(formik.errors.total_enfants_ecodim)}
                  helperText={formik.touched.total_enfants_ecodim && formik.errors.total_enfants_ecodim}
                  autoComplete="off"
                />
                <FormControl fullWidth>
                  <InputLabel id="services-list-edit-superviseur-label">{i18nService.t('services.list.superviseur')}</InputLabel>
                  <Select
                    id="services-list-edit-superviseur"
                    name="superviseur"
                    value={formik.values.superviseur || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.superviseur && Boolean(formik.errors.superviseur)}
                    labelId="services-list-edit-superviseur-label"
                    autoComplete="off"
                  >
                    <MuiMenuItem value="">{i18nService.t('services.list.selectSuperviseur')}</MuiMenuItem>
                    {superviseurs.map(superviseur => (
                      <MuiMenuItem key={superviseur._id || superviseur.id} value={superviseur._id || superviseur.id}>
                        {superviseur.username || superviseur.pseudo}
                      </MuiMenuItem>
                    ))}
                  </Select>
                  {formik.touched.superviseur && formik.errors.superviseur && (
                    <div style={{ color: 'red', fontSize: '0.75rem' }}>
                      {formik.errors.superviseur}
                    </div>
                  )}
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditClose} color="primary">
                {i18nService.t('common.actions.cancel')}
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {i18nService.t('common.actions.save')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Dialog de confirmation suppression service */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title={i18nService.t('services.list.deleteService')}
        content={serviceToDelete ? `Êtes-vous sûr de vouloir supprimer le service du ${format(new Date(serviceToDelete.date), 'dd/MM/yyyy', { locale: fr })} ?` : "Êtes-vous sûr de vouloir supprimer ce service ?"}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeleteService}
      />

         {/* Snackbar feedback actions membres */}
              <Snackbar
                open={notification.open}
                autoHideDuration={2000}
                onClose={hideNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                <Alert onClose={hideNotification} severity={notification.severity} sx={{ width: '100%' }}>
                  {notification.message}
                </Alert>
              </Snackbar>

        <TablePagination
          component="div"
          count={filteredServices.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={i18nService.t('common.pagination.rowsPerPage')}
        />
      </Paper>
    </AccessControl>
  );
};

export default ServicesList;
