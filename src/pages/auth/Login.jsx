import React from 'react';
import { handleApiError } from '@utils/errorHandler';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Link
} from '@mui/material';
import { login } from '@features/auth/authSlice';
import { toast } from 'react-toastify';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Person from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import HttpsSharpIcon from '@mui/icons-material/HttpsSharp';
import i18nService from '@services/i18nService';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      pseudo: '',
      password: ''
    },
    validationSchema: Yup.object({
      pseudo: Yup.string().required(i18nService.t('auth.login.pseudoRequired')),
      password: Yup.string().required(i18nService.t('auth.login.passwordRequired'))
    }),
    onSubmit: async (values) => {
      try {
        await dispatch(login(values)).unwrap();
        toast.success(i18nService.t('auth.login.loginSuccess'));
        // Attendre 1.5 secondes pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } catch (error) {
        // Afficher l'erreur et rediriger seulement si c'est une erreur 401
        toast.error(error.message || i18nService.t('auth.login.loginError'));
        
        // Rediriger vers login seulement si c'est une erreur d'authentification
        if (error.response?.status === 401) {
          setTimeout(() => {
            navigate('/login');
          }, 2000); // Attendre 2 secondes pour que l'utilisateur voie l'erreur
        }
      }
    }
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        height: '100vh',
        background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 50%, #DDD6FE 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        width: '100vw',
        overflow: 'auto',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background:
            'radial-gradient(1200px 800px at 15% 20%, #DDD6FE 0%, transparent 60%),' +
            'radial-gradient(1000px 700px at 85% 80%, #C4B5FD 0%, transparent 60%),' +
            'radial-gradient(900px 900px at 50% 60%, #EDE9FE 0%, #F5F3FF 80%)',
          backgroundSize: '160% 160%, 160% 160%, 160% 160%',
          backgroundPosition: '0% 50%, 100% 50%, 50% 50%',
          animation: 'gradientBG 22s ease-in-out infinite',
          opacity: 0.9,
          filter: 'saturate(1.05)'
        },
        zIndex: 9999
      }}
    >
      <style>
        {`
          /* fond doux (on garde ton gradient animé mais plus subtil) */
          @keyframes gradientBG {
            0%   { background-position: 0% 50%, 100% 50%, 50% 50%; }
            50%  { background-position: 100% 50%, 0% 50%, 50% 60%; }
            100% { background-position: 0% 50%, 100% 50%, 50% 50%; }
          }

          /* mouvement horizontal des vagues */
          @keyframes waveMove {
            0%   { transform: translate3d(0,0,0); }
            100% { transform: translate3d(-50%,0,0); }
          }

          /* léger balancement vertical pour fluidité (ressac) */
          @keyframes swell {
            0%, 100% { transform: translate3d(0,-2px,0); }
            50%      { transform: translate3d(0, 2px,0); }
          }
        `}
      </style>
      <Container component="main" maxWidth="xs" sx={{
        zIndex: 2,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 0,
        margin: 'auto',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Paper
            elevation={0}
            sx={{
              py: 5,
              px: { xs: 2, sm: 4 },
              borderRadius: '30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 20px 60px rgba(91, 33, 182, 0.15)',
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(25px)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              minWidth: { xs: 'auto', sm: 430 },
              margin: '30px',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 30px 80px rgba(91, 33, 182, 0.20)',
                transform: 'translateY(-5px)'
              }
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
            <HttpsSharpIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              fontWeight: 800, 
              background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1, 
              mt: 2, 
              letterSpacing: '0.5px',
              animation: 'fadeIn 0.8s ease-out'
            }}
          >
            Connexion
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary', 
              mb: 3, 
              textAlign: 'center',
              fontWeight: 500,
              animation: 'fadeIn 1s ease-out'
            }}
          >
              Bienvenue sur ACER HUB !<br/>Accédez à votre espace membre
            </Typography>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ mt: 1, width: '100%' }}
          >
            <TextField
              margin="normal"
              fullWidth
              id="pseudo"
              name="pseudo"
              label={i18nService.t('auth.register.pseudo')}
              value={formik.values.pseudo}
              onChange={formik.handleChange}
              error={formik.touched.pseudo && Boolean(formik.errors.pseudo)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                )
              }}
              helperText={formik.touched.pseudo && formik.errors.pseudo}
              autoFocus
              autoComplete="username"
              sx={{
                background: '#f8fafd',
                borderRadius: 2,
                input: { fontWeight: 500 },
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': { borderColor: 'primary.main', boxShadow: '0 0 0 2px #1976d21a' }
                }
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label={i18nService.t('auth.register.password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HttpsSharpIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? i18nService.t('auth.login.hidePassword') : i18nService.t('auth.login.showPassword')}
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              helperText={formik.touched.password && formik.errors.password}
              sx={{
                background: 'rgba(245, 243, 255, 0.5)',
                borderRadius: '12px',
                input: { fontWeight: 500 },
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '& fieldset': {
                    borderColor: 'rgba(91, 33, 182, 0.2)',
                    borderWidth: '2px'
                  },
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(91, 33, 182, 0.08)',
                    '& fieldset': {
                      borderColor: 'rgba(91, 33, 182, 0.4)'
                    }
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 4px 16px rgba(91, 33, 182, 0.15)',
                    '& fieldset': { 
                      borderColor: 'primary.main',
                      borderWidth: '2px'
                    }
                  }
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.8, 
                fontWeight: 700, 
                fontSize: 18, 
                letterSpacing: '0.5px',
                background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(91, 33, 182, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4C1D95, #6D28D9)',
                  boxShadow: '0 12px 32px rgba(91, 33, 182, 0.35)',
                  transform: 'translateY(-2px)'
                },
                '&:disabled': {
                  background: 'rgba(91, 33, 182, 0.5)',
                  color: 'white'
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? i18nService.t('auth.login.loginInProgress') : i18nService.t('auth.login.loginButton')}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link 
                component={RouterLink} 
                to="/forgot-password" 
                variant="body2" 
                sx={{ 
                  color: 'primary.main', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: 'primary.dark',
                    textDecoration: 'underline'
                  }
                }}
              >
                Mot de passe oublié ?
              </Link>
            </Box>
          </Box>
        </Paper>
        </motion.div>
        <Box sx={{ mt: 2, textAlign: 'center', opacity: 0.8 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'primary.main', 
              letterSpacing: '1px',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(91, 33, 182, 0.1)'
            }}
          >
            © {new Date().getFullYear()} - ACER Rennes - Tous droits réservés
          </Typography>
        </Box>
      </Container>

      {/* vagues animées en bas de l'écran */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: { xs: 140, sm: 180 },
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        {/* couche arrière (plus claire, plus lente) */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '200%',
            height: '100%',
            opacity: 0.1,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '50% 100%',
            animation: 'waveMove 18s linear infinite, swell 7s ease-in-out infinite',
            backgroundImage: `url("data:image/svg+xml;utf8,
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'>
                <path d='M0,0 C150,100 350,0 600,60 C850,120 1050,20 1200,60 L1200,120 L0,120 Z' fill='%23EDE9FE'/>
              </svg>")`
          }}
        />
        {/* couche avant (plus foncée, plus rapide) */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '200%',
            height: '100%',
            opacity: 0.4,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '50% 100%',
            animation: 'waveMove 12s linear infinite, swell 5s ease-in-out infinite',
            transform: 'translateY(6px)',
            backgroundImage: `url("data:image/svg+xml;utf8,
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'>
                <path d='M0,20 C200,80 400,0 600,50 C800,100 1000,40 1200,70 L1200,120 L0,120 Z' fill='%23DDD6FE'/>
              </svg>")`
          }}
        />
      </Box>
    </Box>
  );
};

export default Login;
