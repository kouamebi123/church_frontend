import { Box, Typography, Paper } from '@mui/material';
import i18nService from '../services/i18nService';

const ErrorMessage = ({ error, onRetry }) => (
  <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
    <Paper elevation={3} sx={{ p: 4, bgcolor: '#fff3f3', border: '1px solid #f44336', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 16 }}>
        <circle cx="12" cy="12" r="12" fill="#f44336" fillOpacity="0.1" />
        <path d="M12 7v5" stroke="#f44336" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill="#f44336" />
      </svg>
      <Typography variant="h5" sx={{ color: 'error.main', fontWeight: 'bold', mb: 1 }}>
        {i18nService.t('loading.error')}
      </Typography>
      <Typography variant="subtitle1" sx={{ color: 'error.main', mb: 2 }}>
        {error}
      </Typography>
      <button
        style={{
          padding: '8px 24px',
          background: '#f44336',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: 16
        }}
        onClick={onRetry || (() => window.location.reload())}
      >
        {i18nService.t('common.actions.retry')}
      </button>
    </Paper>
  </Box>
);

export default ErrorMessage;
