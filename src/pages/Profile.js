import React, { useState, useEffect } from 'react';
import { handleApiError } from '../utils/errorHandler';
import { API_BASE_URL } from '../config/apiConfig';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Box,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Tabs,
  Tab,
  Fab,
  Badge,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Edit, PhotoCamera, Delete } from '@mui/icons-material';
import { updateUserProfile } from '../features/auth/authSlice';
import { authService } from '../services/authService';
import { apiService } from '../services/apiService';
import { toast } from 'react-toastify';
import { 
  TRANCHE_AGE_OPTIONS, 
  GENRE_OPTIONS, 
  SITUATION_MATRIMONIALE_OPTIONS, 
  NIVEAU_EDUCATION_OPTIONS
} from '../constants/enums';
import { COUNTRIES } from '../constants/countries';
import { useInitialData } from '../hooks/useInitialData';
import UserPreferences from '../components/UserPreferences';
import i18nService from '../services/i18nService';
import { useLanguageThemeSync } from '../hooks/useLanguageThemeSync';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // État pour le profil
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    pseudo: ''
  });

  // Initialiser le service i18n
  useEffect(() => {
    i18nService.init();
  }, []);

  // Utiliser le hook de synchronisation
  const lastUpdate = useLanguageThemeSync();

  // useEffect pour initialiser les données du profil
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        pseudo: user.pseudo || ''
      });
    }
  }, [user]);

  // État pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // États pour la visibilité des mots de passe
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // États pour la gestion des erreurs
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // États pour le modal de modification complète
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // États pour l'upload d'image de profil
  const [imageUploadDialog, setImageUploadDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [completeProfileData, setCompleteProfileData] = useState({
    username: '',
    pseudo: '',
    email: '',
    genre: '',
    tranche_age: '',
    profession: '',
    ville_residence: '',
    origine: '',
    situation_matrimoniale: '',
    niveau_education: '',
    telephone: '',
    adresse: '',
    image: '',
    departement_id: '',
    eglise_locale_id: ''
  });

  // États pour les listes de référence
  const { churches, departments, loading: dataLoading } = useInitialData();
  
  // État pour les onglets
  const [activeTab, setActiveTab] = useState(0);

  // useEffect pour initialiser les données du profil complet
  useEffect(() => {
    if (user) {
      setCompleteProfileData({
        username: user.username || '',
        pseudo: user.pseudo || '',
        email: user.email || '',
        genre: user.genre || '',
        tranche_age: user.tranche_age || '',
        profession: user.profession || '',
        ville_residence: user.ville_residence || '',
        origine: user.origine || '',
        situation_matrimoniale: user.situation_matrimoniale || '',
        niveau_education: user.niveau_education || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
        image: user.image || '',
        departement_id: user.departement_id || '',
        eglise_locale_id: user.eglise_locale_id || user.eglise_locale?.id || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    // Effacer les erreurs quand l'utilisateur tape
    if (passwordErrors[e.target.name]) {
      setPasswordErrors({
        ...passwordErrors,
        [e.target.name]: ''
      });
    }
  };

  const handleCompleteProfileChange = (e) => {
    setCompleteProfileData({
      ...completeProfileData,
      [e.target.name]: e.target.value
    });
  };

  // Fonctions pour l'upload d'image de profil
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error(i18nService.t('profile.image.invalidFileType'));
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(i18nService.t('profile.image.fileTooLarge'));
        return;
      }

      setSelectedImage(file);
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setImageUploadDialog(true);
    }
    
    // Réinitialiser la valeur pour permettre la sélection du même fichier
    event.target.value = '';
  };

  // Fonction pour déclencher la sélection de fichier
  const triggerFileSelect = () => {
    const input = document.getElementById('profile-image-input');
    if (input) {
      input.click();
    } else {
      console.error('Input file non trouvé');
      toast.error('Erreur: Impossible d\'accéder au sélecteur de fichiers');
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await apiService.users.uploadProfileImage(formData);
      
      // Axios retourne la réponse dans response.data
      if (response.data && response.data.success) {
        // Mettre à jour l'utilisateur dans le store
        dispatch(updateUserProfile({ image: response.data.data.image }));
        toast.success(i18nService.t('profile.image.uploadSuccess'));
        setImageUploadDialog(false);
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        toast.error(response.data?.message || i18nService.t('profile.image.uploadError'));
      }
    } catch (error) {
      toast.error(i18nService.t('profile.image.uploadError'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const response = await apiService.users.removeProfileImage();
      
      // Axios retourne la réponse dans response.data
      if (response.data && response.data.success) {
        dispatch(updateUserProfile({ image: '' }));
        toast.success(i18nService.t('profile.image.removeSuccess'));
      } else {
        toast.error(response.data?.message || i18nService.t('profile.image.removeError'));
      }
    } catch (error) {
      toast.error(i18nService.t('profile.image.removeError'));
    }
  };

  const handleCloseImageDialog = () => {
    setImageUploadDialog(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = i18nService.t('errors.validation.currentPasswordRequired');
    }

    if (!passwordData.newPassword) {
      errors.newPassword = i18nService.t('errors.validation.newPasswordRequired');
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = i18nService.t('errors.validation.passwordMinLength');
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = i18nService.t('errors.validation.confirmPasswordRequired');
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = i18nService.t('errors.validation.passwordMismatch');
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = i18nService.t('errors.validation.passwordMustBeDifferent');
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      toast.success(i18nService.t('success.profileUpdated'));
    } catch (error) {
      toast.error(error.message || i18nService.t('errors.api.updateProfile'));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success(i18nService.t('success.passwordChanged'));
      
      // Réinitialiser le formulaire
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Effacer les erreurs
      setPasswordErrors({});
      
    } catch (error) {
      toast.error(error.message || i18nService.t('errors.api.changePassword'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleOpenEditModal = () => {
    // Recharger les données à chaque ouverture pour éviter les champs vides
    if (user) {
      setCompleteProfileData({
        username: user.username || '',
        pseudo: user.pseudo || '',
        email: user.email || '',
        genre: user.genre || '',
        tranche_age: user.tranche_age || '',
        profession: user.profession || '',
        ville_residence: user.ville_residence || '',
        origine: user.origine || '',
        situation_matrimoniale: user.situation_matrimoniale || '',
        niveau_education: user.niveau_education || '',
        telephone: user.telephone || '',
        adresse: user.adresse || '',
        departement_id: user.departement_id || '',
        eglise_locale_id: user.eglise_locale_id || user.eglise_locale?.id || ''
      });
    }
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    // Ne pas vider les données pour éviter les problèmes de réouverture
    // Les données seront rechargées à la prochaine ouverture
  };

  const handleCompleteProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      await apiService.users.updateProfile(completeProfileData);
      toast.success(i18nService.t('success.profileCompleteUpdated'));
      
      // Mettre à jour le store Redux avec les nouvelles données
      dispatch(updateUserProfile({
        username: completeProfileData.username,
        pseudo: completeProfileData.pseudo,
        email: completeProfileData.email
      }));
      
      // Mettre à jour l'état local avec les nouvelles données
      setFormData({
        username: completeProfileData.username,
        email: completeProfileData.email,
        pseudo: completeProfileData.pseudo
      });
      
      handleCloseEditModal();
    } catch (error) {
      // Utiliser le message sécurisé de notre système d'erreur
      const processedError = handleApiError(error, 'la mise à jour du profil complet');
      toast.error(processedError.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Container maxWidth="md">
      {/* En-tête du profil */}
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Fab
                  size="small"
                  color="primary"
                  aria-label={i18nService.t('profile.image.changePhoto')}
                  onClick={triggerFileSelect}
                  sx={{
                    width: 32,
                    height: 32,
                    '&:hover': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.2s'
                    }
                  }}
                >
                  <PhotoCamera sx={{ fontSize: 16 }} />
                </Fab>
              }
            >
              <Avatar
                src={user?.image ? `${API_BASE_URL}/${user.image}` : undefined}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                    transition: 'opacity 0.2s'
                  }
                }}
                onClick={triggerFileSelect}
                onError={(e) => {
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Badge>
            
            {/* Bouton de suppression d'image (visible seulement si une image existe) */}
            {user?.image && (
              <IconButton
                size="small"
                color="error"
                onClick={handleRemoveImage}
                sx={{
                  position: 'absolute',
                  top: -8,
                  left: -8,
                  bgcolor: 'white',
                  border: '2px solid',
                  borderColor: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.light',
                    color: 'white'
                  }
                }}
              >
                <Delete sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
          
          {/* Input file caché - approche plus robuste */}
          <input
            id="profile-image-input"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          
          <Typography variant="h5" gutterBottom>
            {i18nService.t('profile.title')}
          </Typography>
        </Box>

        {/* Onglets */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            aria-label={i18nService.t('profile.tabs.informations')}
            centered
          >
            <Tab label={i18nService.t('profile.tabs.informations')} />
            <Tab label={i18nService.t('profile.tabs.preferences')} />
            <Tab label={i18nService.t('profile.tabs.security')} />
          </Tabs>
        </Box>

        {/* Contenu des onglets */}
        {activeTab === 0 && (
          <Box>
            {/* Contenu de l'onglet Informations */}
            {!user ? (
              <Box display="flex" justifyContent="center" p={4}>
                <Typography variant="body1" color="text.secondary">
                  {i18nService.t('profile.loading')}
                </Typography>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid xs={12}>
                    <TextField
                      fullWidth
                      id="profile-username"
                      label={i18nService.t('profile.basicInfo.username')}
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      autoComplete="username"
                    />
                  </Grid>
                  <Grid xs={12}>
                    <TextField
                      fullWidth
                      id="profile-pseudo"
                      label={i18nService.t('profile.basicInfo.pseudo')}
                      name="pseudo"
                      value={formData.pseudo}
                      onChange={handleChange}
                      autoComplete="nickname"
                    />
                  </Grid>
                  <Grid xs={12}>
                    <TextField
                      fullWidth
                      id="profile-email"
                      label={i18nService.t('profile.basicInfo.email')}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                  </Grid>
                  <Grid xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                    >
                      {i18nService.t('profile.basicInfo.updateButton')}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Bouton pour modifier le profil complet */}
            <Box display="flex" justifyContent="center">
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                startIcon={<Edit />}
                onClick={handleOpenEditModal}
                sx={{ minWidth: 250 }}
              >
                {i18nService.t('profile.basicInfo.editCompleteButton')}
              </Button>
            </Box>
          </Box>
        )}

        {/* Onglet Préférences */}
        {activeTab === 1 && (
          <UserPreferences />
        )}

                {/* Onglet Sécurité */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
              {i18nService.t('profile.security.title')}
            </Typography>

        <form onSubmit={handlePasswordSubmit}>
          <Grid container spacing={3}>
            <Grid xs={12}>
              <TextField
                fullWidth
                id="profile-current-password"
                label={i18nService.t('profile.security.currentPassword')}
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                id="profile-new-password"
                label={i18nService.t('profile.security.newPassword')}
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                id="profile-confirm-password"
                label={i18nService.t('profile.security.confirmPassword')}
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                {i18nService.t('profile.security.passwordInfo')}
              </Alert>
            </Grid>

            <Grid xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? i18nService.t('common.actions.processing') : i18nService.t('profile.security.changePasswordButton')}
              </Button>
            </Grid>
          </Grid>
        </form>
          </Box>
        )}
      </Paper>

      {/* Modal de modification complète du profil */}
      <Dialog 
        open={editModalOpen} 
        onClose={handleCloseEditModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {i18nService.t('profile.completeProfile.title')}
        </DialogTitle>
        <form onSubmit={handleCompleteProfileSubmit}>
          <DialogContent>
            {!completeProfileData.username ? (
              <Box display="flex" justifyContent="center" p={4}>
                <Typography variant="body1" color="text.secondary">
                  {i18nService.t('profile.completeProfile.loading')}
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  id="complete-profile-username"
                  label={i18nService.t('profile.completeProfile.username')}
                  name="username"
                  value={completeProfileData.username}
                  onChange={handleCompleteProfileChange}
                  required
                  autoComplete="username"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  id="complete-profile-pseudo"
                  label={i18nService.t('profile.completeProfile.pseudo')}
                  name="pseudo"
                  value={completeProfileData.pseudo}
                  onChange={handleCompleteProfileChange}
                  required
                  autoComplete="nickname"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  id="complete-profile-email"
                  label={i18nService.t('profile.completeProfile.email')}
                  name="email"
                  type="email"
                  value={completeProfileData.email}
                  onChange={handleCompleteProfileChange}
                  autoComplete="email"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  id="complete-profile-telephone"
                  label={i18nService.t('profile.completeProfile.telephone')}
                  name="telephone"
                  value={completeProfileData.telephone}
                  onChange={handleCompleteProfileChange}
                  autoComplete="tel"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="complete-profile-genre-label">{i18nService.t('profile.completeProfile.genre')}</InputLabel>
                  <Select
                    id="complete-profile-genre"
                    name="genre"
                    value={completeProfileData.genre}
                    onChange={handleCompleteProfileChange}
                    label={i18nService.t('profile.completeProfile.genre')}
                    labelId="complete-profile-genre-label"
                    autoComplete="sex"
                  >
                    {GENRE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="complete-profile-tranche-age-label">{i18nService.t('profile.completeProfile.trancheAge')}</InputLabel>
                  <Select
                    id="complete-profile-tranche-age"
                    name="tranche_age"
                    value={completeProfileData.tranche_age}
                    onChange={handleCompleteProfileChange}
                    label={i18nService.t('profile.completeProfile.trancheAge')}
                    labelId="complete-profile-tranche-age-label"
                    autoComplete="bday"
                  >
                    {TRANCHE_AGE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  id="complete-profile-profession"
                  label={i18nService.t('profile.completeProfile.profession')}
                  name="profession"
                  value={completeProfileData.profession}
                  onChange={handleCompleteProfileChange}
                  required
                  autoComplete="organization-title"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  id="complete-profile-ville-residence"
                  label={i18nService.t('profile.completeProfile.villeResidence')}
                  name="ville_residence"
                  value={completeProfileData.ville_residence}
                  onChange={handleCompleteProfileChange}
                  autoComplete="address-level2"
                  required
                />
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="complete-profile-origine-label">{i18nService.t('profile.completeProfile.origine')}</InputLabel>
                  <Select
                    id="complete-profile-origine"
                    name="origine"
                    value={completeProfileData.origine}
                    onChange={handleCompleteProfileChange}
                    label={i18nService.t('profile.completeProfile.origine')}
                    labelId="complete-profile-origine-label"
                    autoComplete="country"
                  >
                    {COUNTRIES.map((country) => (
                      <MenuItem key={country.value} value={country.value}>
                        {country.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="complete-profile-situation-matrimoniale-label">{i18nService.t('profile.completeProfile.situationMatrimoniale')}</InputLabel>
                  <Select
                    id="complete-profile-situation-matrimoniale"
                    name="situation_matrimoniale"
                    value={completeProfileData.situation_matrimoniale}
                    onChange={handleCompleteProfileChange}
                    label={i18nService.t('profile.completeProfile.situationMatrimoniale')}
                    labelId="complete-profile-situation-matrimoniale-label"
                    autoComplete="off"
                  >
                    {SITUATION_MATRIMONIALE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="complete-profile-niveau-education-label">{i18nService.t('profile.completeProfile.niveauEducation')}</InputLabel>
                  <Select
                    id="complete-profile-niveau-education"
                    name="niveau_education"
                    value={completeProfileData.niveau_education}
                    onChange={handleCompleteProfileChange}
                    label={i18nService.t('profile.completeProfile.niveauEducation')}
                    labelId="complete-profile-niveau-education-label"
                    autoComplete="off"
                  >
                    {NIVEAU_EDUCATION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={6}>
                <FormControl fullWidth sx={{ minWidth: 180 }}>
                  <InputLabel id="complete-profile-departement-label">{i18nService.t('profile.completeProfile.departement')}</InputLabel>
                  <Select
                    id="complete-profile-departement"
                    name="departement_id"
                    value={completeProfileData.departement_id || ''}
                    onChange={handleCompleteProfileChange}
                    label={i18nService.t('profile.completeProfile.departement')}
                    labelId="complete-profile-departement-label"
                    disabled={dataLoading}
                    autoComplete="off"
                  >
                    <MenuItem value="">
                      <em>{i18nService.t('profile.completeProfile.noDepartement')}</em>
                    </MenuItem>
                    {Array.isArray(departments) && departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label={i18nService.t('profile.completeProfile.adresse')}
                  name="adresse"
                  value={completeProfileData.adresse}
                  onChange={handleCompleteProfileChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
            )}
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Note :</strong> {i18nService.t('profile.completeProfile.note')}
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal} color="primary">
              {i18nService.t('common.actions.cancel')}
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isUpdating}
            >
              {isUpdating ? i18nService.t('common.actions.processing') : i18nService.t('common.actions.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de prévisualisation et confirmation d'upload d'image */}
      <Dialog
        open={imageUploadDialog}
        onClose={handleCloseImageDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {i18nService.t('profile.image.previewTitle')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {imagePreview && (
              <Avatar
                src={imagePreview}
                sx={{
                  width: 150,
                  height: 150,
                  border: '3px solid',
                  borderColor: 'primary.main'
                }}
              />
            )}
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {selectedImage?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              {i18nService.t('profile.image.confirmUpload')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog} color="primary">
            {i18nService.t('common.actions.cancel')}
          </Button>
          <Button 
            onClick={handleImageUpload}
            variant="contained" 
            color="primary"
            disabled={isUploadingImage}
            startIcon={isUploadingImage ? <CircularProgress size={16} /> : null}
          >
            {isUploadingImage ? i18nService.t('common.actions.uploading') : i18nService.t('common.actions.upload')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
