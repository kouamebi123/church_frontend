import { Box, Typography, CircularProgress } from '@mui/material';
import i18nService from '../services/i18nService';

const Loading = ({ titre }) => (
  <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
    <CircularProgress size={60} thickness={5} sx={{ color: 'primary.main', mb: 3, animation: 'spin 1.2s linear infinite' }} />
    <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
      {titre}
    </Typography>
    <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 2 }}>
      {i18nService.t('loading.preparing')}
    </Typography>
    <Box sx={{ width: 80, height: 8, bgcolor: 'grey.200', borderRadius: 4, overflow: 'hidden' }}>
      <Box sx={{ width: '60%', height: '100%', bgcolor: 'primary.light', animation: 'progressBar 1.5s infinite alternate' }} />
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
