import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  LockResetOutlined, 
  Visibility, 
  VisibilityOff,
  CheckCircleOutline
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import authAxios from '@services/authService';
import i18nService from '@services/i18nService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast.error('Lien de réinitialisation invalide');
      navigate('/forgot-password');
      return;
    }
    setToken(tokenParam);
  }, [searchParams, navigate]);

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .required('Nouveau mot de passe requis')
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
        ),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Les mots de passe doivent correspondre')
        .required('Confirmation du mot de passe requise')
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await authAxios.post('/auth/reset-password', {
          resetToken: token,
          newPassword: values.newPassword
        });
        
        if (response.data.success) {
          setIsSuccess(true);
          toast.success('Mot de passe réinitialisé avec succès !');
          
          // Rediriger vers la connexion après 3 secondes
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Erreur lors de la réinitialisation';
        toast.error(message);
        
        // Si le token est expiré, rediriger vers forgot-password
        if (message.includes('expiré') || message.includes('invalide')) {
          setTimeout(() => {
            navigate('/forgot-password');
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Page de succès
  if (isSuccess) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6
      }}>
        <Container component="main" maxWidth="sm">
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
                padding: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '30px',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 20px 60px rgba(91, 33, 182, 0.15)',
                animation: 'fadeIn 0.8s ease-out'
              }}
            >
            <Avatar sx={{ 
              m: 1, 
              background: 'linear-gradient(135deg, #10B981, #059669)', 
              width: 72, 
              height: 72,
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
              animation: 'scaleIn 0.6s ease-out'
            }}>
              <CheckCircleOutline sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                mb: 3, 
                mt: 2,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10B981, #059669)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'fadeIn 0.8s ease-out'
              }}
            >
              Mot de passe réinitialisé !
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
              ✅ Votre mot de passe a été réinitialisé avec succès !
            </Alert>

            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
              Vous allez être redirigé vers la page de connexion dans quelques secondes.
              <br />
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </Typography>

            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Aller à la connexion
            </Button>
          </Paper>
        </Box>
      </Container>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6
    }}>
      <Container component="main" maxWidth="sm">
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
              padding: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '30px',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 20px 60px rgba(91, 33, 182, 0.15)',
              animation: 'fadeIn 0.8s ease-out'
            }}
          >
          <Avatar sx={{ 
            m: 1, 
            background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', 
            width: 72, 
            height: 72,
            boxShadow: '0 8px 24px rgba(91, 33, 182, 0.25)',
            animation: 'scaleIn 0.6s ease-out'
          }}>
            <LockResetOutlined sx={{ fontSize: 36 }} />
          </Avatar>
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              mb: 3, 
              mt: 2,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'fadeIn 0.8s ease-out'
            }}
          >
            Nouveau mot de passe
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
            Définissez votre nouveau mot de passe sécurisé
          </Alert>

          <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
            <TextField
              fullWidth
              margin="normal"
              id="reset-password-new"
              name="newPassword"
              label={i18nService.t('auth.resetPassword.newPassword')}
              type={showPassword ? 'text' : 'password'}
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
              helperText={formik.touched.newPassword && formik.errors.newPassword}
              disabled={isLoading}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              fullWidth
              margin="normal"
              id="reset-password-confirm"
              name="confirmPassword"
              label={i18nService.t('auth.register.confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              disabled={isLoading}
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
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Réinitialiser le mot de passe'}
            </Button>
          </form>

          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/forgot-password')}
            sx={{ mt: 1 }}
          >
            Retour à la demande de réinitialisation
          </Button>
        </Paper>
      </Box>
    </Container>
    </Box>
  );
};

export default ResetPassword;
