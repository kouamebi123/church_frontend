import { Box, Typography, CircularProgress } from '@mui/material';
import i18nService from '@services/i18nService';

const Loading = ({ titre }) => (
  <Box sx={{ 
    minHeight: '60vh', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center'
  }}>
    <Box sx={{
      width: 120,
      height: 120,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mb: 3,
      boxShadow: '0 8px 24px rgba(102, 45, 145, 0.25)',
      animation: 'pulse 2s ease-in-out infinite'
    }}>
      <CircularProgress 
        size={70} 
        thickness={4} 
        sx={{ 
          color: 'white',
          animation: 'spin 1.2s linear infinite'
        }} 
      />
    </Box>
    <Typography variant="h5" sx={{ 
      fontWeight: 800, 
      mb: 1,
      background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }}>
      {titre}
    </Typography>
    <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
      {i18nService.t('loading.preparing')}
    </Typography>
    <Box sx={{ 
      width: 200, 
      height: 8, 
      background: 'rgba(102, 45, 145, 0.1)', 
      borderRadius: 4, 
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Box sx={{ 
        width: '60%', 
        height: '100%', 
        background: 'linear-gradient(90deg, #662d91, #9e005d)', 
        animation: 'progressBar 1.5s infinite alternate',
        boxShadow: '0 0 10px rgba(102, 45, 145, 0.5)'
      }} />
    </Box>
    <style>{`
      @keyframes progressBar {
        0% { width: 20%; }
        100% { width: 100%; }
      }
      @keyframes spin {
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </Box>
);

export default Loading;
