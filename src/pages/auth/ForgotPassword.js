import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { LockResetOutlined, EmailOutlined, AccessTime } from '@mui/icons-material';
import { toast } from 'react-toastify';
import authAxios from '../../services/authService';
import i18nService from '../../services/i18nService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('request'); // 'request' ou 'link-sent'
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes en secondes
  const [countdownActive, setCountdownActive] = useState(false);

  // Gestion du compte à rebours
  useEffect(() => {
    let interval;
    
    if (countdownActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCountdownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdownActive, countdown]);

  // Formatage du temps restant
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Étape 1: Demande de réinitialisation
  const requestFormik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(i18nService.t('common.validation.email'))
        .required(i18nService.t('common.validation.required'))
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await authAxios.post('/auth/forgot-password', {
          email: values.email.trim()
        });
        
        if (response.data.success) {
          // Toujours passer à l'étape suivante, l'email sera envoyé
          setStep('link-sent');
          setCountdown(600); // Réinitialiser le compte à rebours
          setCountdownActive(true); // Démarrer le compte à rebours
          toast.success(i18nService.t('auth.forgotPassword.successMessage'));
        }
      } catch (error) {
        const message = error.response?.data?.message || i18nService.t('auth.forgotPassword.errors.requestError');
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Étape 2: Lien envoyé
  if (step === 'link-sent') {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'success.main' }}>
              <EmailOutlined />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
              Vérifiez votre email
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
              ✅ Instructions de réinitialisation envoyées !
            </Alert>

            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
              Nous avons envoyé un lien de réinitialisation à votre adresse email.
            </Typography>

            {/* Compte à rebours en temps réel */}
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<AccessTime />}
                label={`Temps restant : ${formatTime(countdown)}`}
                color={countdown > 300 ? 'success' : countdown > 60 ? 'warning' : 'error'}
                variant="outlined"
                sx={{ 
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  minWidth: '200px'
                }}
              />
              
              {countdown === 0 && (
                <Alert severity="warning" sx={{ width: '100%' }}>
                  ⚠️ Le lien a expiré. Veuillez demander un nouveau lien.
                </Alert>
              )}
            </Box>

            {/* Lien de test supprimé - Email toujours envoyé */}

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setStep('request');
                  setCountdown(600);
                  setCountdownActive(false);
                }}
                disabled={countdown > 0 && countdownActive}
                startIcon={countdown > 0 && countdownActive ? <CircularProgress size={20} /> : null}
              >
                {countdown > 0 && countdownActive 
                  ? i18nService.t('auth.forgotPassword.waitMessage', { time: formatTime(countdown) })
                  : i18nService.t('auth.forgotPassword.newLinkButton')
                }
              </Button>
              
              <Button
                fullWidth
                variant="text"
                component={RouterLink}
                to="/login"
              >
                Retour à la connexion
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockResetOutlined />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Mot de passe oublié
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
            Entrez votre email pour recevoir les instructions de réinitialisation
          </Alert>

          <form onSubmit={requestFormik.handleSubmit} style={{ width: '100%' }}>
            <TextField
              fullWidth
              margin="normal"
              id="forgot-password-email"
              name="email"
              label={i18nService.t('auth.register.email')}
              type="email"
              placeholder="votre@email.com"
              value={requestFormik.values.email}
              onChange={requestFormik.handleChange}
              error={requestFormik.touched.email && Boolean(requestFormik.errors.email)}
              helperText={requestFormik.touched.email && requestFormik.errors.email}
              disabled={isLoading}
              autoComplete="email"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : i18nService.t('auth.forgotPassword.submitButton')}
            </Button>
          </form>

          <Box sx={{ mt: 2 }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Retour à la connexion
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
