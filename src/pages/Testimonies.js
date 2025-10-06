import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  FormHelperText,
  GlobalStyles,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { API_URL } from '../config/apiConfig';

// Styles personnalisés - Design inspirant pour témoignages
const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
    background: `
    linear-gradient(135deg, var(--overlay-light) 0%, var(--overlay-medium) 50%, var(--overlay-heavy) 100%),
    url('/IMG_7993.jpg')
  `,
  backgroundSize: '100% 100%',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
  padding: theme.spacing(2, 0),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, var(--overlay-bottom) 0%, var(--overlay-middle) 50%, var(--overlay-bottom) 100%)',
    zIndex: 1,
  },
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100vh',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(5),
  },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: '800px',
  background: 'var(--modal-bg)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(4),
  boxShadow: '0 25px 50px var(--modal-shadow), 0 0 0 1px var(--modal-border-light)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'var(--gradient-primary)'
  }
}));


const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(4),
  background: 'var(--gradient-header)',
  borderRadius: theme.spacing(3),
  color: 'white',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width=' + "'" + '60' + "'" + ' height=' + "'" + '60' + "'" + ' viewBox=' + "'" + '0 0 60 60' + "'" + ' xmlns=' + "'" + 'http://www.w3.org/2000/svg' + "'" + '%3E%3Cg fill=' + "'" + 'none' + "'" + ' fill-rule=' + "'" + 'evenodd' + "'" + '%3E%3Cg fill=' + "'" + '%23ffffff' + "'" + ' fill-opacity=' + "'" + '0.1' + "'" + '%3E%3Ccircle cx=' + "'" + '30' + "'" + ' cy=' + "'" + '30' + "'" + ' r=' + "'" + '2' + "'" + '/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.3,
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  '& img': {
    height: 80,
    width: 'auto',
    filter: 'drop-shadow(0 4px 8px var(--drop-shadow))',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    }
  }
}));

const FormSection = styled(Box)(() => ({
  width: '100%',
}));

const FileUploadArea = styled(Box)(({ theme }) => ({
  width: '100%',
  border: `3px dashed var(--primary-color)`,
  borderRadius: theme.spacing(3),
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: 'var(--upload-bg)',
  '&:hover': {
    backgroundColor: 'var(--upload-hover-bg)',
    borderColor: 'var(--secondary-color)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px var(--upload-shadow)',
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  background: 'var(--gradient-button)',
  color: 'white',
  padding: theme.spacing(2, 6),
  fontSize: '1.2rem',
  fontWeight: 600,
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  boxShadow: '0 8px 25px var(--button-shadow)',
  '&:hover': {
    background: 'var(--gradient-button-hover)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 35px var(--button-hover-shadow)',
  },
  '&:disabled': {
    background: 'var(--button-disabled)',
    color: 'var(--button-disabled-text)',
  }
}));

const TestimoniesPage = () => {
  const [churches, setChurches] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');
  const [illustrations, setIllustrations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fonction pour gérer l'animation vers le formulaire
  const handleStartAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowForm(true);
      setIsAnimating(false);
    }, 800);
  };

  // Types de témoignage
  const testimonyTypes = [
    { value: 'GOUVERNANCE', label: 'Gouvernance' },
    { value: 'ECODIM', label: 'ECODIM' },
    { value: 'SECTION', label: 'Section' },
    { value: 'VISITOR', label: 'Visiteur' }
  ];

  // Schéma de validation Yup
  const validationSchema = Yup.object({
    firstName: Yup.string().when(['isAnonymous', 'wantsToTestify'], {
      is: (isAnonymous, wantsToTestify) => !isAnonymous || wantsToTestify,
      then: (schema) => schema.required('Le prénom est requis'),
      otherwise: (schema) => schema.notRequired()
    }),
    lastName: Yup.string().when(['isAnonymous', 'wantsToTestify'], {
      is: (isAnonymous, wantsToTestify) => !isAnonymous || wantsToTestify,
      then: (schema) => schema.required('Le nom est requis'),
      otherwise: (schema) => schema.notRequired()
    }),
    phone: Yup.string().when('wantsToTestify', {
      is: true,
      then: (schema) => schema.test('phone-or-email', 'Un numéro de téléphone ou un email est requis pour témoigner lors d\'un culte', function(value) {
        const { email } = this.parent;
        return !!(value || email);
      }),
      otherwise: (schema) => schema.notRequired()
    }),
    email: Yup.string().email('Format d\'email invalide').when('wantsToTestify', {
      is: true,
      then: (schema) => schema.test('phone-or-email', 'Un numéro de téléphone ou un email est requis pour témoigner lors d\'un culte', function(value) {
        const { phone } = this.parent;
        return !!(value || phone);
      }),
      otherwise: (schema) => schema.notRequired()
    }),
    churchId: Yup.string().required("L'église est requise"),
    networkId: Yup.string(),
    testimonyType: Yup.string().when('networkId', {
      is: (networkId) => !networkId || networkId === 'AUCUN_RESEAU',
      then: (schema) => schema.required('Le type de personne est requis'),
      otherwise: (schema) => schema.notRequired()
    }),
    section: Yup.string().when('testimonyType', {
      is: 'SECTION',
      then: (schema) => schema.required('La section est requise'),
      otherwise: (schema) => schema.notRequired()
    }),
    unit: Yup.string().when('testimonyType', {
      is: 'SECTION',
      then: (schema) => schema.required('L\'unité est requise'),
      otherwise: (schema) => schema.notRequired()
    }),
    category: Yup.string().required('La catégorie est requise'),
    content: Yup.string()
      .required('Le témoignage est requis')
      .min(100, 'Le témoignage doit contenir au moins 100 caractères')
      .max(5000, 'Le témoignage ne doit pas dépasser 5000 caractères'),
    isAnonymous: Yup.boolean(),
    wantsToTestify: Yup.boolean()
  });

  // Configuration Formik
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      churchId: '',
      networkId: '',
      testimonyType: '',
      section: '',
      unit: '',
      category: '',
      content: '',
      isAnonymous: true,
      wantsToTestify: false
    },
    validationSchema: validationSchema,
    validateOnMount: false,
    onSubmit: async (values) => {
      setSubmitting(true);
      setError('');

      try {
        const formDataToSend = new FormData();

        // Ajouter les données du formulaire
        formDataToSend.append('firstName', values.firstName);
        formDataToSend.append('lastName', values.lastName);
        formDataToSend.append('phone', values.phone || '');
        formDataToSend.append('email', values.email || '');
        formDataToSend.append('churchId', values.churchId);
        // Convertir "AUCUN_RESEAU" en null, sinon garder la valeur
        const networkId = values.networkId === 'AUCUN_RESEAU' ? null : values.networkId;
        formDataToSend.append('networkId', networkId || '');
        formDataToSend.append('testimonyType', values.testimonyType || '');
        formDataToSend.append('section', values.section || '');
        formDataToSend.append('unit', values.unit || '');
        formDataToSend.append('category', values.category);
        formDataToSend.append('content', values.content);
        formDataToSend.append('isAnonymous', String(values.isAnonymous));
        formDataToSend.append('wantsToTestify', String(values.wantsToTestify));

        // Ajouter les fichiers
        illustrations.forEach((file) => {
          formDataToSend.append('illustrations', file);
        });

        const response = await fetch(`${API_URL}/testimonies`, {
          method: 'POST',
          body: formDataToSend
        });

        const result = await response.json();

        if (result.success) {
          setShowSuccessModal(true);
          // Réinitialiser le formulaire
          formik.resetForm();
          setIllustrations([]);
          setNetworks([]);
        } else {
          setError(result.message || 'Erreur lors de la soumission');
        }
      } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        setError('Erreur lors de la soumission du témoignage');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [churchesRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/testimonies/churches`),
          fetch(`${API_URL}/testimonies/categories`)
        ]);

        if (churchesRes.ok) {
          const churchesData = await churchesRes.json();
          setChurches(churchesData.data || []);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Charger les réseaux quand l'église change
  useEffect(() => {
    const loadNetworks = async () => {
      if (formik.values.churchId) {
        try {
          const response = await fetch(`${API_URL}/testimonies/networks/${formik.values.churchId}`);
          if (response.ok) {
            const data = await response.json();
            setNetworks(data.data || []);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des réseaux:', error);
        }
      } else {
        setNetworks([]);
      }
    };

    loadNetworks();
  }, [formik.values.churchId]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    
    // Validation des limites
    const maxFiles = 2;
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    
    // Vérifier le nombre total de fichiers
    if (illustrations.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} fichiers autorisés. Vous avez déjà ${illustrations.length} fichier(s) sélectionné(s).`);
      return;
    }
    
    // Vérifier la taille de chaque fichier
    for (const file of files) {
      if (file.size > maxFileSize) {
        setError(`Le fichier "${file.name}" est trop volumineux. Taille maximale autorisée : 5 MB.`);
        return;
      }
    }
    
    // Vérifier la taille totale
    const currentTotalSize = illustrations.reduce((total, file) => total + file.size, 0);
    const newTotalSize = files.reduce((total, file) => total + file.size, 0);
    const maxTotalSize = 10 * 1024 * 1024; // 10MB total
    
    if (currentTotalSize + newTotalSize > maxTotalSize) {
      setError(`Taille totale des fichiers trop importante. Maximum autorisé : 10 MB au total.`);
      return;
    }
    
    setError(''); // Effacer les erreurs précédentes
    setIllustrations((prev) => [...prev, ...files]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (file) => {
    if (file.type?.startsWith('image/')) return <ImageIcon />;
    if (file.type?.startsWith('video/')) return <VideoIcon />;
    return <DocumentIcon />;
  };

  if (loading) {
    return (
      <StyledContainer>
        <ContentWrapper>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress size={60} sx={{ color: 'var(--primary-color)' }} />
          </Box>
        </ContentWrapper>
      </StyledContainer>
    );
  }

  // Page d'accueil
  if (!showForm) {
    return (
      <>
        <GlobalStyles styles={{
          'html, body': {
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--scrollbar-white) transparent'
          },
          'html::-webkit-scrollbar, body::-webkit-scrollbar': {
            width: '10px',
            height: '10px'
          },
          'html::-webkit-scrollbar-track, body::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          'html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--scrollbar-white)',
            borderRadius: '999px',
            border: '3px solid transparent',
            backgroundClip: 'padding-box'
          },
          '*, *::before, *::after': {
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--scrollbar-white-hover) transparent'
          },
          '*::-webkit-scrollbar': {
            width: '10px',
            height: '10px'
          },
          '*::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--scrollbar-white-hover)',
            borderRadius: '999px',
            border: '3px solid transparent',
            backgroundClip: 'padding-box'
          }
        }} />
        <StyledContainer>
          <ContentWrapper>
            <StyledPaper 
              maxWidth="md"
              sx={{ 
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
                <Box 
                  textAlign="center" 
                  width="100%" 
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh'
                  }}
                >
                  <LogoContainer sx={{ mb: 4 }}>
                    <img
                      src="/logo-sm-acer (1).png"
                      alt="Logo ACER"
                    />
                  </LogoContainer>

                  <Typography
                    component="h1"
                    variant="h2"
                    sx={{
                      mb: 4,
                      fontWeight: 'bold',
                      color: 'var(--primary-color)',
                      textAlign: 'center',
                      fontFamily: '"Playfair Display", serif',
                      textShadow: '0 2px 4px var(--text-shadow)',
                      fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
                    }}
                  >
                    WELCOME HOME
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mb: 6,
                      lineHeight: 1.8,
                      color: 'var(--primary-color)',
                      fontFamily: '"Crimson Text", serif',
                      textAlign: 'center',
                      maxWidth: '800px',
                      mx: 'auto',
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                      px: 2
                    }}
                  >
                    Nous sommes heureux de vous accueillir sur la plateforme de témoignages des églises ACER de la zone Nord-Ouest. 
                    Que vous soyez membre d'une de nos assemblées ou un visiteur, sachez que votre témoignage sera une bénédiction pour nous. 
                    En effet, nous servons un Dieu qui fait des œuvres merveilleuses dans nos vies. C'est pourquoi, nous voulons faire connaître sa grandeur et sa fidélité de génération en génération.
                  </Typography>

                  <SubmitButton
                    variant="contained"
                    size="large"
                    startIcon={<SendIcon />}
                    onClick={handleStartAnimation}
                    disabled={isAnimating}
                    sx={{
                      px: 8,
                      py: 3,
                      fontSize: '1.4rem',
                      borderRadius: '50px',
                      boxShadow: '0 8px 32px var(--card-shadow)',
                      transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 12px 40px var(--card-hover-shadow)',
                      }
                    }}
                  >
                    {isAnimating ? 'Préparation...' : 'Partagez votre témoignage'}
                  </SubmitButton>
                </Box>
              </StyledPaper>
            </ContentWrapper>
          </StyledContainer>
      </>
    );
  }

  return (
    <>
      <GlobalStyles styles={{
        /* WebKit (Chrome, Edge, Safari) */
        'html, body': {
          /* largeur fine, à ajuster */
          scrollbarWidth: 'thin',              /* Firefox */
          /* thumb blanc transparent, track transparent pour Firefox */
          scrollbarColor: 'var(--scrollbar-white) transparent'
        },
        'html::-webkit-scrollbar, body::-webkit-scrollbar': {
          width: '10px',
          height: '10px'
        },
        'html::-webkit-scrollbar-track, body::-webkit-scrollbar-track': {
          background: 'transparent'           /* << pas de blanc */
        },
        'html::-webkit-scrollbar-thumb, body::-webkit-scrollbar-thumb': {
          backgroundColor: 'var(--scrollbar-white)',         /* couleur du thumb blanc transparent */
          borderRadius: '999px',
          /* bord transparent pour que le track reste invisible */
          border: '3px solid transparent',
          backgroundClip: 'padding-box'
        },

        /* Optionnel : mêmes règles pour tout conteneur scrollable */
        '*, *::before, *::after': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--scrollbar-white-hover) transparent'
        },
        '*::-webkit-scrollbar': {
          width: '10px',
          height: '10px'
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent'
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'var(--scrollbar-white-hover)',
          borderRadius: '999px',
          border: '3px solid transparent',
          backgroundClip: 'padding-box'
        },
        /* Animation pour les points pulsants */
        '@keyframes pulse': {
          '0%': {
            opacity: 1,
            transform: 'scale(1)'
          },
          '50%': {
            opacity: 0.5,
            transform: 'scale(1.2)'
          },
          '100%': {
            opacity: 1,
            transform: 'scale(1)'
          }
        }
      }} />
        <StyledContainer>
          <ContentWrapper>
            <Slide direction="up" in={showForm} timeout={800}>
              <StyledPaper maxWidth="md">
          {/* Header avec logo */}
          <Box textAlign="center" mb={4} width="100%">
            <LogoContainer>
              <img
                src="/logo-sm-acer (1).png"
                alt="Logo ACER"
              />
            </LogoContainer>

            <Typography
              component="h1"
              variant="h3"
              sx={{
                mb: 2,
                fontWeight: 'bold',
                color: '#4B0082',
                textAlign: 'center',
                fontFamily: '"Playfair Display", serif',
                textShadow: '0 2px 4px var(--text-shadow)'
              }}
            >
              Partagez votre témoignage
            </Typography>

            <HeaderSection>
              <Typography variant="h4" component="h2" fontWeight="bold" sx={{ fontFamily: '"Playfair Display", serif', color: 'white' }}>
                Apocalypse 12:11
              </Typography>

              <Typography variant="h6" sx={{ opacity: 0.95, fontStyle: 'italic', fontFamily: '"Crimson Text", serif', lineHeight: 1.6, color: 'white' }}>
                "Ils l'ont vaincu à cause du sang de l'agneau et à cause de la parole de leur témoignage,
                et ils n'ont pas aimé leur vie jusqu'à craindre la mort"
              </Typography>
            </HeaderSection>
          </Box>

          {/* Formulaire */}
          <FormSection>
            <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ width: '100%' }}>
              
              {/* Section : Informations personnelles */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: '#4B0082',
                    borderBottom: '2px solid',
                    borderColor: 'var(--primary-color)',
                    pb: 1,
                    fontWeight: 600,
                    fontFamily: '"Playfair Display", serif'
                  }}
                >
                  Informations personnelles
                </Typography>

                {/* Option anonyme */}
                <Box sx={{
                  p: 1,
                  backgroundColor: 'var(--info-bg)',
                  borderRadius: 3,
                  border: '2px solid var(--info-border)',
                  mb: 3,
                  boxShadow: '0 4px 15px var(--info-shadow)'
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        id="testimony-is-anonymous"
                        name="isAnonymous"
                        checked={!formik.values.isAnonymous}
                        onChange={(e) => {
                          const isAnonymous = !e.target.checked;
                          formik.setFieldValue('isAnonymous', isAnonymous);
                          if (isAnonymous) {
                            formik.setFieldValue('firstName', '');
                            formik.setFieldValue('lastName', '');
                          }
                        }}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: 'var(--primary-color)',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'var(--primary-color)',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="h6" sx={{
                        fontWeight: 600,
                        color: 'var(--primary-color)',
                        fontFamily: '"Playfair Display", serif'
                      }}>
                        Je souhaite m'identifier
                      </Typography>
                    }
                  />
                  <FormHelperText sx={{ ml: 4, color: '#4B0082', fontSize: '0.9rem' }}>
                    {formik.values.isAnonymous
                      ? "Si vous ne souhaitez pas vous identifier, votre témoignage sera publié de manière anonyme"
                      : "Votre nom et prénom seront affichés avec votre témoignage"
                    }
                  </FormHelperText>
                </Box>

                {/* Prénom + Nom : même ligne, 50% / 50% */}
                {!formik.values.isAnonymous && (
                  <Grid container spacing={2}>
                    <Grid item xs={6} sx={{ width: '48.5%'}}>
                      <TextField
                        fullWidth
                        id="testimony-firstName"
                        name="firstName"
                        label="Prénom *"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                        helperText={formik.touched.firstName && formik.errors.firstName}
                        autoComplete="given-name"
                      />
                    </Grid>
                    <Grid item xs={6} sx={{ width: '48.5%'}}>
                      <TextField
                        fullWidth
                        id="testimony-lastName"
                        name="lastName"
                        label="Nom *"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                        helperText={formik.touched.lastName && formik.errors.lastName}
                        autoComplete="family-name"
                      />
                    </Grid>
                  </Grid>
                )}

                {/* Téléphone + Email : même ligne, 50% / 50% */}
                {!formik.values.isAnonymous && (
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6} sx={{ width: '48.5%'}}>
                      <TextField
                        fullWidth
                        id="testimony-phone"
                        name="phone"
                        label="Numéro de téléphone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                        autoComplete="tel"
                      />
                    </Grid>
                    <Grid item xs={6} sx={{ width: '48.5%'}}>
                      <TextField
                        fullWidth
                        id="testimony-email"
                        name="email"
                        label="Adresse email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                        autoComplete="email"
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>

              {/* Section : Appartenance */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: '#4B0082',
                    borderBottom: '2px solid',
                    borderColor: 'var(--primary-color)',
                    pb: 1,
                    fontWeight: 600,
                    fontFamily: '"Playfair Display", serif'
                  }}
                >
                  Appartenance
                </Typography>

                {/* Église + Réseau : même ligne, 50% / 50% */}
                <Grid container spacing={2}>
                  <Grid item xs={6} sx={{ width: '48.5%'}}>
                    <FormControl fullWidth error={formik.touched.churchId && Boolean(formik.errors.churchId)}>
                      <InputLabel id="testimony-church-label">Église *</InputLabel>
                      <Select
                        id="testimony-church"
                        name="churchId"
                        value={formik.values.churchId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Église *"
                        labelId="testimony-church-label"
                        displayEmpty
                        autoComplete="off"
                      >
                        {churches.map((church) => (
                          <MenuItem key={church.id} value={church.id}>
                            {church.nom} - {church.ville}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.churchId && formik.errors.churchId && (
                        <FormHelperText>{formik.errors.churchId}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={6} sx={{ width: '48.5%'}}>
                    <FormControl fullWidth>
                      <InputLabel id="testimony-network-label">Réseau</InputLabel>
                      <Select
                        id="testimony-network"
                        name="networkId"
                        value={formik.values.networkId}
                        onChange={(e) => {
                          formik.handleChange(e);
                          // Réinitialiser le type de personne si un réseau est sélectionné
                          if (e.target.value && e.target.value !== 'AUCUN_RESEAU') {
                            formik.setFieldValue('testimonyType', '');
                            formik.setFieldValue('section', '');
                            formik.setFieldValue('unit', '');
                          }
                        }}
                        onBlur={formik.handleBlur}
                        label="Réseau"
                        labelId="testimony-network-label"
                        displayEmpty
                        disabled={!formik.values.churchId}
                        autoComplete="off"
                      >
                        <MenuItem value="AUCUN_RESEAU">
                          <em>Aucun réseau</em>
                        </MenuItem>
                        {networks.map((network) => (
                          <MenuItem key={network.id} value={network.id}>
                            {network.nom}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Type de personne (seulement si pas de réseau sélectionné) */}
                {(!formik.values.networkId || formik.values.networkId === 'AUCUN_RESEAU') && (
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6} sx={{ width: '48.5%'}}>
                      <FormControl fullWidth error={formik.touched.testimonyType && Boolean(formik.errors.testimonyType)}>
                        <InputLabel id="testimony-type-label">Type de personne *</InputLabel>
                        <Select
                          id="testimony-type"
                          name="testimonyType"
                          value={formik.values.testimonyType}
                          onChange={(e) => {
                            formik.handleChange(e);
                            // Réinitialiser section et unit si type change
                            if (e.target.value !== 'SECTION') {
                              formik.setFieldValue('section', '');
                              formik.setFieldValue('unit', '');
                            }
                          }}
                          onBlur={formik.handleBlur}
                          label="Type de personne *"
                          labelId="testimony-type-label"
                          displayEmpty
                          autoComplete="off"
                        >
                          {testimonyTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.testimonyType && formik.errors.testimonyType && (
                          <FormHelperText>{formik.errors.testimonyType}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    {/* Section et Unité (seulement si type = SECTION) */}
                    {formik.values.testimonyType === 'SECTION' && (
                      <>
                        <Grid item xs={3} sx={{ width: '24%'}}>
                          <TextField
                            fullWidth
                            id="testimony-section"
                            name="section"
                            label="Section *"
                            value={formik.values.section}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.section && Boolean(formik.errors.section)}
                            helperText={formik.touched.section && formik.errors.section}
                            placeholder="Ex: Section 1"
                            autoComplete="off"
                          />
                        </Grid>
                        <Grid item xs={3} sx={{ width: '24%'}}>
                          <TextField
                            fullWidth
                            id="testimony-unit"
                            name="unit"
                            label="Unité *"
                            value={formik.values.unit}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.unit && Boolean(formik.errors.unit)}
                            helperText={formik.touched.unit && formik.errors.unit}
                            placeholder="Ex: Unité A"
                            autoComplete="off"
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                )}
              </Box>

              {/* Section : Témoignage */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: '#4B0082',
                    borderBottom: '2px solid',
                    borderColor: 'var(--primary-color)',
                    pb: 1,
                    fontWeight: 600,
                    fontFamily: '"Playfair Display", serif'
                  }}
                >
                  Témoignage
                </Typography>

                {/* Catégorie + Illustrations : même ligne, 50% / 50% */}
                <Grid container spacing={2}>
                  <Grid item xs={6} sx={{ width: '48.5%'}}>
                    <FormControl fullWidth error={formik.touched.category && Boolean(formik.errors.category)}>
                      <InputLabel id="testimony-category-label">Catégorie du témoignage *</InputLabel>
                      <Select
                        id="testimony-category"
                        name="category"
                        value={formik.values.category}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        label="Catégorie du témoignage *"
                        labelId="testimony-category-label"
                        displayEmpty
                        autoComplete="off"
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.value} value={category.value}>
                            {category.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.category && formik.errors.category && (
                        <FormHelperText>{formik.errors.category}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={6} sx={{ width: '48.5%'}}>
                    <FileUploadArea sx={{ 
                      height: '56px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-start', 
                      border: '1px solid var(--border-primary)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--background-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      padding: '0 16px',
                      '&:hover': {
                        borderColor: 'rgba(76, 0, 130, 0.28)',
                        backgroundColor: 'rgba(76, 0, 130, 0.1)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(76, 0, 130, 0.09)'
                      }
                    }}>
                      <input
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                        style={{ display: 'none' }}
                        id="file-upload"
                        multiple
                        type="file"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%', cursor: 'pointer' }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <ImageIcon sx={{ fontSize: 28, color: '#4B0082' }} />
                          <Box textAlign="left">
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'var(--primary-color)',
                                fontWeight: 600,
                                fontFamily: '"Playfair Display", serif',
                                fontSize: '0.9rem'
                              }}
                            >
                              Illustrations (Optionnel)
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#666',
                                fontSize: '0.75rem',
                                display: 'block'
                              }}
                            >
                              Images, vidéos, documents (2 max, 5 Mo chacun)
                            </Typography>
                          </Box>
                        </Box>
                      </label>
                    </FileUploadArea>

                    {/* Liste des fichiers sélectionnés */}
                    {illustrations.length > 0 && (
                      <Box mt={2} width="100%">
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{
                            color: 'var(--primary-color)',
                            fontWeight: 600,
                            fontFamily: '"Playfair Display", serif',
                          }}
                        >
                          Fichiers sélectionnés :
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                          {illustrations.map((file, index) => (
                            <Chip
                              key={`${file.name}-${index}`}
                              icon={getFileIcon(file)}
                              label={`${file.name} (${formatFileSize(file.size)})`}
                              onDelete={() => {
                                const newFiles = illustrations.filter((_, i) => i !== index);
                                setIllustrations(newFiles);
                              }}
                              size="small"
                              sx={{
                                mr: 0.5,
                                mb: 0.5,
                                backgroundColor: 'var(--chip-bg)',
                                color: 'var(--primary-color)',
                                border: '1px solid var(--chip-border)',
                                '& .MuiChip-deleteIcon': {
                                  color: 'var(--primary-color)',
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Grid>

                  {/* Votre témoignage : pleine largeur juste en-dessous */}
                  <Grid item xs={12} sx={{ width: '100%'}}>
                    <TextField
                      fullWidth
                      id="testimony-content"
                      name="content"
                      label="Votre témoignage *"
                      multiline
                      rows={6}
                      value={formik.values.content}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.content && Boolean(formik.errors.content)}
                      helperText={formik.touched.content && formik.errors.content}
                      placeholder="Partagez votre témoignage détaillé ici..."
                      autoComplete="off"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Section : Témoignage lors d'un culte */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: '#4B0082',
                    borderBottom: '2px solid',
                    borderColor: 'var(--primary-color)',
                    pb: 1,
                    fontWeight: 600,
                    fontFamily: '"Playfair Display", serif'
                  }}
                >
                  Témoignage lors d'un culte
                </Typography>

                <Box sx={{
                  p: 2,
                  backgroundColor: 'var(--info-bg)',
                  borderRadius: 3,
                  border: '2px solid var(--info-border)',
                  boxShadow: '0 4px 15px var(--info-shadow)'
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        id="testimony-wants-to-testify"
                        name="wantsToTestify"
                        checked={formik.values.wantsToTestify}
                        onChange={(e) => {
                          const wantsToTestify = e.target.checked;
                          formik.setFieldValue('wantsToTestify', wantsToTestify);
                          
                          // Si veut témoigner, forcer l'identification
                          if (wantsToTestify) {
                            formik.setFieldValue('isAnonymous', false);
                          }
                        }}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: 'var(--primary-color)',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'var(--primary-color)',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="h6" sx={{
                        fontWeight: 600,
                        color: 'var(--primary-color)',
                        fontFamily: '"Playfair Display", serif'
                      }}>
                        Je souhaite témoigner lors d'un culte
                      </Typography>
                    }
                  />
                  <FormHelperText sx={{ ml: 4, color: '#4B0082', fontSize: '0.9rem' }}>
                    {formik.values.wantsToTestify
                      ? "Vous devrez vous identifier et fournir un moyen de contact. L'équipe vous contactera pour confirmer votre participation."
                      : "Votre témoignage sera uniquement publié en ligne."
                    }
                  </FormHelperText>
                </Box>
              </Box>

              {/* Bouton de soumission */}
              <Box display="flex" justifyContent="center" mt={5}>
                <SubmitButton
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SendIcon />}
                  disabled={submitting}
                >
                  {submitting ? 'Soumission...' : 'Soumettre le témoignage'}
                </SubmitButton>
              </Box>
            </Box>
          </FormSection>

          {/* Messages d'erreur */}
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
              </StyledPaper>
            </Slide>
          </ContentWrapper>
        </StyledContainer>

      {/* Modal de succès (version compacte & responsive) */}
<Dialog
  open={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  maxWidth="sm"
  fullWidth
  // réduit l'espace autour et recentre proprement
  sx={{
    '& .MuiDialog-container': { alignItems: 'center' },
    '& .MuiDialog-paper': { m: { xs: 1.5, sm: 2 } }
  }}
  PaperProps={{
    sx: {
      borderRadius: 4,
      background: 'linear-gradient(135deg, var(--background-primary) 0%, var(--background-secondary) 50%, var(--background-primary) 100%)',
      boxShadow: '0 14px 36px var(--modal-shadow), 0 6px 16px var(--drop-shadow)',
      border: '1px solid var(--info-border)',
      overflow: 'hidden',
      position: 'relative',
      // barre supérieure fine
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        height: 4,
        background: 'var(--gradient-primary)'
      }
    }
  }}
  BackdropProps={{ sx: { backdropFilter: 'blur(2px)' } }}
>
  <DialogTitle
    sx={{
      textAlign: 'center',
      py: { xs: 2, sm: 2.5 },
      background: 'var(--gradient-success)',
      color: 'white'
    }}
  >
    <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--white-overlay)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
          boxShadow: '0 6px 16px var(--white-shadow)'
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 32, color: 'var(--text-inverse)' }} />
      </Box>
      <Typography
        variant="h6"
        component="h2"
        fontWeight={700}
        color="white"
        sx={{
          fontFamily: '"Playfair Display", serif',
          textShadow: '0 1px 2px var(--white-text-shadow)',
          fontSize: { xs: '1.15rem', sm: '1.30rem' },
          lineHeight: 1.2
        }}
      >
        Témoignage transmis avec succès&nbsp;!
      </Typography>
    </Box>
  </DialogTitle>

  <DialogContent
    sx={{
      textAlign: 'center',
      py: { xs: 2, sm: 2.5 },
      px: { xs: 2, sm: 3 },
      background: 'linear-gradient(135deg, var(--background-primary) 0%, var(--background-secondary) 100%)'
    }}
  >
    <Typography
      variant="body1"
      sx={{
        fontFamily: '"Crimson Text", serif',
        lineHeight: 1.6,
        color: '#4B0082',
        fontSize: { xs: '1rem', sm: '1.1rem' },
        mb: 1.5, mt: { xs: 1.5, sm: 2 }
      }}
    >
      Merci d’avoir partagé ce que Dieu a fait. Votre témoignage compte !
    </Typography>
    <Typography
      variant="subtitle1"
      sx={{
        fontFamily: '"Playfair Display", serif',
        fontWeight: 600,
        color: 'var(--secondary-color)',
        fontSize: { xs: '1rem', sm: '1.1rem' }
      }}
    >
      Que Dieu vous bénisse&nbsp;! 🙏
    </Typography>
  </DialogContent>

  <DialogActions
    sx={{
      justifyContent: 'center',
      py: { xs: 1.5, sm: 2 },
      px: { xs: 2, sm: 3 },
      background: 'linear-gradient(135deg, var(--background-secondary) 0%, var(--background-primary) 100%)'
    }}
  >
    <Button
      onClick={() => setShowSuccessModal(false)}
      variant="contained"
      sx={{
        background: 'var(--success-gradient)',
        color: 'white',
        px: { xs: 3, sm: 4 },
        py: 1.1,
        borderRadius: 2.5,
        fontSize: { xs: '0.95rem', sm: '1rem' },
        fontWeight: 700,
        textTransform: 'none',
        fontFamily: '"Playfair Display", serif',
        boxShadow: '0 8px 22px var(--success-button-shadow)',
        '&:hover': {
          background: 'var(--gradient-success-hover)',
          transform: 'translateY(-1px)',
          boxShadow: '0 10px 28px var(--success-hover-shadow)'
        },
        '&:active': { transform: 'translateY(0)' }
      }}
    >
      Fermer
    </Button>
  </DialogActions>
</Dialog>

    </>
  );
};

export default TestimoniesPage;
