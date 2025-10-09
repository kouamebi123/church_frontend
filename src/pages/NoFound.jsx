import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { SentimentDissatisfied } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import i18nService from '@services/i18nService';

const NoFound = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      flexDirection: 'column', 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(102, 45, 145, 0.1) 0%, transparent 70%)',
        animation: 'pulse 3s ease-in-out infinite'
      },
      '@keyframes pulse': {
        '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.5 },
        '50%': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0.8 }
      }
    }}>
      <Box sx={{ 
        p: 6, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '40px',
        boxShadow: '0 20px 60px rgba(102, 45, 145, 0.15)',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeIn 0.8s ease-out',
        maxWidth: '600px',
        mx: 2
      }}>
        <Box sx={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #EF4444, #F87171)',
          boxShadow: '0 10px 30px rgba(239, 68, 68, 0.25)',
          mb: 3,
          animation: 'scaleIn 0.6s ease-out'
        }}>
          <SentimentDissatisfied sx={{ fontSize: 64, color: 'white' }} />
        </Box>
        <Typography 
          variant="h1" 
          sx={{ 
            fontWeight: 900, 
            background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2, 
            letterSpacing: '4px',
            fontSize: { xs: '4rem', sm: '6rem' },
            animation: 'slideInFromLeft 0.8s ease-out'
          }}
        >
          404
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            color: 'text.primary', 
            mb: 2,
            fontWeight: 700,
            textAlign: 'center',
            animation: 'fadeIn 1s ease-out'
          }}
        >
          {i18nService.t('errors.notFound.title')}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary', 
            mb: 4, 
            textAlign: 'center',
            maxWidth: '400px',
            lineHeight: 1.8,
            animation: 'fadeIn 1.2s ease-out'
          }}
        >
          {i18nService.t('errors.notFound.message')}<br />
          {i18nService.t('errors.notFound.backHome')}
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={() => navigate('/')} 
          sx={{ 
            fontWeight: 700, 
            px: 5, 
            py: 1.5,
            fontSize: '1.1rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
            boxShadow: '0 8px 24px rgba(102, 45, 145, 0.25)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: 'scaleIn 1s ease-out',
            '&:hover': {
              background: 'linear-gradient(135deg, #1b1464, #662d91)',
              boxShadow: '0 12px 32px rgba(102, 45, 145, 0.35)',
              transform: 'translateY(-3px) scale(1.05)'
            }
          }}
        >
          {i18nService.t('errors.notFound.backHome')}
        </Button>
      </Box>
    </Box>
  );
};

export default NoFound;
