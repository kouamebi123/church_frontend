import React from 'react';
import { handleApiError } from '@utils/errorHandler';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import securityService from '@services/securityService';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Avatar,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { PersonAddOutlined, PhotoCamera, Delete } from '@mui/icons-material';
import { register, registerWithImage } from '@features/auth/authSlice';
import { toast } from 'react-toastify';
import { GENRE_OPTIONS, TRANCHE_AGE_OPTIONS, SITUATION_MATRIMONIALE_OPTIONS, NIVEAU_EDUCATION_OPTIONS, QUALIFICATION_OPTIONS } from '@constants/enums';
import { COUNTRIES } from '@constants/countries';
import { useInitialData } from '@hooks/useInitialData';
import i18nService from '@services/i18nService';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const { churches, departments, loading: dataLoading, error: dataError } = useInitialData();

  // État pour l'upload d'image
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState(null);
  const [imageUploadDialog, setImageUploadDialog] = React.useState(false);
  const [confirmedImage, setConfirmedImage] = React.useState(null); // Image précédemment confirmée
  
  // État pour la question sur le département
  const [sertDansDepartement, setSertDansDepartement] = React.useState('non');

  // Fonctions pour l'upload d'image
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validation du type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image valide');
        return;
      }

      // Validation de la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }

      // Sauvegarder l'image précédemment confirmée si elle existe
      if (selectedImage && !confirmedImage) {
        setConfirmedImage(selectedImage);
      }

      setSelectedImage(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setImageUploadDialog(true);
      };
      reader.readAsDataURL(file);
    }
    
    // Réinitialiser la valeur de l'input pour permettre la sélection du même fichier
    event.target.value = '';
  };

  const handleCloseImageDialog = () => {
    setImageUploadDialog(false);
    
    // Restaurer l'image précédemment confirmée si elle existe
    if (confirmedImage) {
      setSelectedImage(confirmedImage);
      // Recréer la prévisualisation pour l'image confirmée
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(confirmedImage);
    } else {
      // Si pas d'image confirmée, supprimer la sélection actuelle
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleConfirmImage = () => {
    setImageUploadDialog(false);
    // Marquer cette image comme confirmée
    setConfirmedImage(selectedImage);
    // L'image est confirmée et sera envoyée avec le formulaire lors de la soumission
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setConfirmedImage(null); // Supprimer aussi l'image confirmée
    setImageUploadDialog(false);
  };

  // Gérer le changement de réponse sur le département
  const handleDepartementChange = (event) => {
    const value = event.target.value;
    setSertDansDepartement(value);
    
    if (value === 'oui') {
      // Si l'utilisateur répond "oui", sélectionner le premier département par défaut
      if (departments.length > 0) {
        formik.setFieldValue('departement_id', departments[0].id);
      }
    } else if (value === 'non') {
      // Si l'utilisateur répond "non", vider le champ département
      formik.setFieldValue('departement_id', '');
      formik.setFieldTouched('departement_id', false);
    }
  };

  // Validation manuelle du département
  const validateDepartement = () => {
    if (sertDansDepartement === 'oui' && !formik.values.departement_id) {
      formik.setFieldError('departement_id', 'Département requis si vous servez dans un département');
      return false;
    }
    return true;
  };

  const formik = useFormik({
    initialValues: {
      username: '',
      pseudo: '',
      email: '',
      password: '',
      confirmPassword: '',
      genre: GENRE_OPTIONS[0].value, // Premier élément de la liste
      tranche_age: TRANCHE_AGE_OPTIONS[0].value, // Premier élément de la liste
      profession: '',
      ville_residence: '',
      origine: 'France', // Valeur par défaut spécifique
      situation_matrimoniale: SITUATION_MATRIMONIALE_OPTIONS[0].value, // Premier élément de la liste
      niveau_education: NIVEAU_EDUCATION_OPTIONS[0].value, // Premier élément de la liste
      qualification: 'EN_INTEGRATION',
      telephone: '',
      adresse: '',

      departement_id: '',
      eglise_locale_id: ''
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required('Nom d\'utilisateur requis')
        .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
      pseudo: Yup.string()
        .required('Pseudo requis')
        .min(3, 'Le pseudo doit contenir au moins 3 caractères'),
      email: Yup.string()
        .email('Email invalide')
        .required('Email requis'),
      password: Yup.string()
        .required('Mot de passe requis')
        .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
        .required('Confirmation du mot de passe requise'),
      genre: Yup.string()
        .required('Genre requis'),
      tranche_age: Yup.string()
        .required('Tranche d\'âge requise'),
      profession: Yup.string()
        .required('Profession requise'),
      ville_residence: Yup.string()
        .required('Ville de résidence requise'),
      origine: Yup.string()
        .required('Origine requise'),
      situation_matrimoniale: Yup.string()
        .required('Situation matrimoniale requise'),
      niveau_education: Yup.string()
        .required('Niveau d\'éducation requis'),
      qualification: Yup.string()
        .required('Qualification requise')
        .oneOf(['QUALIFICATION_12', 'QUALIFICATION_144', 'QUALIFICATION_1728', 'LEADER', 'RESPONSABLE_RESEAU', 'RESPONSABLE_DEPARTEMENT', 'REGULIER', 'IRREGULIER', 'EN_INTEGRATION', 'GOUVERNANCE', 'ECODIM', 'RESPONSABLE_ECODIM'], 'Qualification invalide'),
      telephone: Yup.string()
        .matches(/^[0-9+\-\s()]+$/, 'Format de téléphone invalide'),
      adresse: Yup.string(),
      departement_id: Yup.string().test(
        'departement-required',
        'Département requis si vous servez dans un département',
        function(value) {
          // Cette validation sera gérée manuellement dans le composant
          return true;
        }
      ),
      eglise_locale_id: Yup.string()
        .required('Église locale requise')
    }),
    validateOnMount: false,
    onSubmit: async (values) => {
      try {
        // Validation manuelle du département
        if (!validateDepartement()) {
          return;
        }

        const { confirmPassword, ...registerData } = values;
        
        // Validation du mot de passe avec securityService AVANT l'inscription
        const passwordValidation = securityService.validate('password', registerData.password);
        if (!passwordValidation.isValid) {
          toast.error(passwordValidation.errors.join(', '));
          return;
        }

        // Validation et sanitization avec securityService
        const sanitizedData = securityService.sanitizeObject(registerData, {
          username: 'string',
          pseudo: 'string',
          email: 'email',
          password: 'string',
          genre: 'string',
          tranche_age: 'string',
          profession: 'string',
          ville_residence: 'string',
          origine: 'string',
          situation_matrimoniale: 'string',
          niveau_education: 'string',
          qualification: 'string',
          telephone: 'string',
          adresse: 'string',
          departement_id: 'string',
          eglise_locale_id: 'string'
        });

        // Log de sécurité
        securityService.logSecurityEvent('user_registration_attempt', {
          email: sanitizedData.email,
          username: sanitizedData.username
        });

        // Inscription avec ou sans image
        if (selectedImage) {
          const formData = new FormData();
          
          // Ajouter tous les champs du formulaire
          Object.keys(sanitizedData).forEach(key => {
            if (sanitizedData[key] !== null && sanitizedData[key] !== undefined && sanitizedData[key] !== '') {
              formData.append(key, sanitizedData[key]);
            }
          });
          
          // Ajouter l'image
          formData.append('image', selectedImage);
          
          // Utiliser l'action spéciale pour l'inscription avec image
          await dispatch(registerWithImage(formData)).unwrap();
        } else {
          // Inscription normale sans image
          await dispatch(register(sanitizedData)).unwrap();
        }

        toast.success('Inscription réussie !');
        navigate('/');
      } catch (error) {
        toast.error(error.message || 'Erreur lors de l\'inscription');
      }
    }
  });

  // Définir les valeurs par défaut pour les champs dynamiques
  React.useEffect(() => {
    if (!dataLoading && churches.length > 0 && !formik.values.eglise_locale_id) {
      // Définir la première église comme valeur par défaut
      formik.setFieldValue('eglise_locale_id', churches[0].id);
    }
    
    // Pour le département, on garde la valeur vide par défaut (optionnel)
    // L'utilisateur peut choisir "Aucun département" ou sélectionner un département
  }, [dataLoading, churches, departments, formik]);

  return (
    <Box sx={{
      minHeight: '100vh',
      py: 6
    }}>
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Paper
            elevation={0}
            sx={{
              padding: { xs: 3, sm: 5 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '30px',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 20px 60px rgba(102, 45, 145, 0.15)',
              position: 'relative',
              animation: 'fadeIn 0.8s ease-out',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: (theme) => theme.palette.primary.main
            }
          }}
        >
          
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              mb: 3, 
              fontWeight: 'bold',
              color: 'primary.main',
              textAlign: 'center'
            }}
          >
            Inscription
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ 
                    position: 'relative',
                    '&:hover .delete-button': {
                      opacity: 1
                    }
                  }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <IconButton
                          color="primary"
                          aria-label={i18nService.t('auth.register.changePhoto')}
                          onClick={() => document.getElementById('register-image-input').click()}
                          sx={{
                            bgcolor: 'white',
                            border: '2px solid',
                            borderColor: 'primary.main',
                            zIndex: 5,
                            '&:hover': {
                              bgcolor: 'white',
                              transform: 'scale(1.1)',
                              transition: 'transform 0.2s'
                            }
                          }}
                        >
                          <PhotoCamera />
                        </IconButton>
                      }
                    >
                      <Avatar
                        src={imagePreview}
                        sx={{
                          width: 100,
                          height: 100,
                          bgcolor: 'primary.main',
                          border: '3px solid',
                          borderColor: 'primary.main',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                            transition: 'opacity 0.2s'
                          }
                        }}
                        onClick={() => document.getElementById('register-image-input').click()}
                      >
                        <PersonAddOutlined sx={{ fontSize: 40 }} />
                      </Avatar>
                    </Badge>
                    
                    {selectedImage && (
                      <IconButton
                        className="delete-button"
                        size="small"
                        color="error"
                        onClick={handleRemoveImage}
                        sx={{
                          position: 'absolute',
                          top: 2,
                          left: 2,
                          bgcolor: 'white',
                          border: '2px solid',
                          borderColor: 'error.main',
                          width: 24,
                          height: 24,
                          opacity: 0,
                          transition: 'all 0.2s',
                          zIndex: 10,
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'white',
                            transform: 'scale(1.1)',
                            transition: 'all 0.2s'
                          }
                        }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    {selectedImage ? selectedImage.name : 'Cliquez pour ajouter une image (optionnel)'}
                  </Typography>
                  
                  {/* Input file caché */}
                  <input
                    type="file"
                    id="register-image-input"
                    accept="image/*"
                    onChange={handleImageSelect}
                    onClick={(e) => {
                      // Forcer la mise à jour même si c'est le même fichier
                      e.target.value = '';
                    }}
                    style={{ display: 'none' }}
                  />
                </Box>
              </Grid>
            </Grid>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ 
              width: '100%',
              '& .MuiTextField-root, & .MuiFormControl-root': {
                mb: 2
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.95rem'
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                '&:hover fieldset': {
                  borderColor: 'primary.main'
                }
              },
              '& .MuiInputBase-input': {
                fontSize: '0.95rem'
              }
            }}
          >
            {/* Section : Informations de connexion */}
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: 'text.secondary',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                pb: 1
              }}
            >
              Informations de connexion
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="register-username"
                  name="username"
                  label="Nom d'utilisateur"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                  autoComplete="username"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="register-pseudo"
                  name="pseudo"
                  label={i18nService.t('auth.register.pseudo')}
                  value={formik.values.pseudo}
                  onChange={formik.handleChange}
                  error={formik.touched.pseudo && Boolean(formik.errors.pseudo)}
                  helperText={formik.touched.pseudo && formik.errors.pseudo}
                  autoComplete="nickname"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="register-email"
                  name="email"
                  label={i18nService.t('auth.register.email')}
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  autoComplete="email"
                />
              </Grid>
            </Grid>

            {/* Section : Informations personnelles */}
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: 'text.secondary',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                pb: 1
              }}
            >
              Informations personnelles
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.genre && Boolean(formik.errors.genre)}
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '13px 14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <InputLabel id="register-genre-label">Genre</InputLabel>
                  <Select
                    id="register-genre"
                    name="genre"
                    value={formik.values.genre}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label={i18nService.t('auth.register.genre')}
                    labelId="register-genre-label"
                    displayEmpty
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

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.tranche_age && Boolean(formik.errors.tranche_age)}
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '13px 14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <InputLabel id="register-tranche-age-label">Tranche d'âge</InputLabel>
                  <Select
                    id="register-tranche-age"
                    name="tranche_age"
                    value={formik.values.tranche_age}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Tranche d'âge"
                    labelId="register-tranche-age-label"
                    displayEmpty
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="profession"
                  name="profession"
                  label={i18nService.t('auth.register.profession')}
                  value={formik.values.profession}
                  onChange={formik.handleChange}
                  error={formik.touched.profession && Boolean(formik.errors.profession)}
                  helperText={formik.touched.profession && formik.errors.profession}
                  autoComplete="organization-title"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="ville_residence"
                  name="ville_residence"
                  label={i18nService.t('auth.register.villeResidence')}
                  value={formik.values.ville_residence}
                  onChange={formik.handleChange}
                  error={formik.touched.ville_residence && Boolean(formik.errors.ville_residence)}
                  helperText={formik.touched.ville_residence && formik.errors.ville_residence}
                  autoComplete="address-level2"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.origine && Boolean(formik.errors.origine)}
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '13px 14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <InputLabel id="register-origine-label">Pays d'origine</InputLabel>
                  <Select
                    id="register-origine"
                    name="origine"
                    value={formik.values.origine}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Pays d'origine"
                    labelId="register-origine-label"
                    displayEmpty
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

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.situation_matrimoniale && Boolean(formik.errors.situation_matrimoniale)}
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '13px 14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <InputLabel id="register-situation-matrimoniale-label">Situation matrimoniale</InputLabel>
                  <Select
                    id="register-situation-matrimoniale"
                    name="situation_matrimoniale"
                    value={formik.values.situation_matrimoniale}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label={i18nService.t('auth.register.situationMatrimoniale')}
                    labelId="register-situation-matrimoniale-label"
                    displayEmpty
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

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.niveau_education && Boolean(formik.errors.niveau_education)}
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '13px 14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <InputLabel id="register-niveau-education-label">Niveau d'éducation</InputLabel>
                  <Select
                    id="register-niveau-education"
                    name="niveau_education"
                    value={formik.values.niveau_education}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Niveau d'éducation"
                    labelId="register-niveau-education-label"
                    displayEmpty
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

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.qualification && Boolean(formik.errors.qualification)}
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '13px 14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <InputLabel id="register-qualification-label">Qualification</InputLabel>
                  <Select
                    id="register-qualification"
                    name="qualification"
                    value={formik.values.qualification}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label={i18nService.t('auth.register.qualification')}
                    labelId="register-qualification-label"
                    displayEmpty
                    autoComplete="off"
                  >
                    {QUALIFICATION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Section : Informations de contact */}
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: 'text.secondary',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                pb: 1
              }}
            >
              Informations de contact
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="telephone"
                  name="telephone"
                  label={i18nService.t('auth.register.telephone')}
                  value={formik.values.telephone}
                  onChange={formik.handleChange}
                  error={formik.touched.telephone && Boolean(formik.errors.telephone)}
                  helperText={formik.touched.telephone && formik.errors.telephone}
                  placeholder="06 XX XX XX XX"
                  autoComplete="tel"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="adresse"
                  name="adresse"
                  label={i18nService.t('auth.register.adresse')}
                  value={formik.values.adresse}
                  onChange={formik.handleChange}
                  error={formik.touched.adresse && Boolean(formik.errors.adresse)}
                  helperText={formik.touched.adresse && formik.errors.adresse}
                  placeholder="123 Rue de la Paix, 35000 Rennes"
                  autoComplete="street-address"
                />
              </Grid>

            </Grid>

            {/* Section : Appartenance */}
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: 'text.secondary',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                pb: 1
              }}
            >
              Appartenance
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {/* Église locale - Prend toute la largeur */}
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.eglise_locale_id && Boolean(formik.errors.eglise_locale_id)}
                  required
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '13px 14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <InputLabel id="register-eglise-locale-label">Église locale *</InputLabel>
                  <Select
                    id="register-eglise-locale"
                    name="eglise_locale_id"
                    value={formik.values.eglise_locale_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Église locale *"
                    labelId="register-eglise-locale-label"
                    disabled={dataLoading}
                    displayEmpty
                    autoComplete="off"
                  >
                    {churches.map((church) => (
                      <MenuItem key={church.id} value={church.id}>
                        {church.nom} - {church.ville}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {dataLoading && (
                  <Typography variant="caption" color="text.secondary">
                    Chargement des églises...
                  </Typography>
                )}
                {dataError && (
                  <Typography variant="caption" color="error">
                    Erreur: {dataError}
                  </Typography>
                )}
              </Grid>
              
              {/* Question département - Prend toute la largeur */}
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Service dans un département</InputLabel>
                  <Select
                    value={sertDansDepartement}
                    onChange={handleDepartementChange}
                    label={i18nService.t('auth.register.serviceInDepartment')}
                    sx={{
                      '& .MuiSelect-select': {
                        padding: '13px 14px',
                      },
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  >
                    <MenuItem value="non">Non, je ne sers pas dans un département</MenuItem>
                    <MenuItem value="oui">Oui, je sers dans un département</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Champ département conditionnel - Prend toute la largeur */}
              {sertDansDepartement === 'oui' && (
                <Grid item xs={12}>
                  <FormControl 
                    fullWidth 
                    error={formik.touched.departement_id && Boolean(formik.errors.departement_id)}
                    sx={{
                      '& .MuiSelect-select': {
                        padding: '13px 14px',
                      },
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  >
                    <InputLabel>Département</InputLabel>
                    <Select
                      name="departement_id"
                      value={formik.values.departement_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label={i18nService.t('auth.register.departement')}
                      disabled={dataLoading}
                      displayEmpty
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.nom}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>

            {/* Section : Sécurité */}
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: 'text.secondary',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                pb: 1
              }}
            >
              Sécurité
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label={i18nService.t('auth.register.password')}
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label={i18nService.t('auth.register.confirmPassword')}
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Inscription...' : 'S\'inscrire'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                {'Vous avez déjà un compte ? Connectez-vous'}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Dialog de prévisualisation et confirmation d'upload d'image */}
      <Dialog
        open={imageUploadDialog}
        onClose={handleCloseImageDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirmer l'upload de l'image
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
            Voulez-vous utiliser cette image comme photo de profil ?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog} color="primary">
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmImage}
            variant="contained" 
            color="primary"
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Box>
  );
};

export default Register;
