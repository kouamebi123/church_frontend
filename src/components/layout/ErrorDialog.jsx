import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box, Avatar } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

const ErrorDialog = ({ open, onClose, title = 'Erreur', content = 'Une erreur est survenue.' }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(239, 68, 68, 0.15)',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ 
        textAlign: 'center', 
        pt: 4,
        background: 'linear-gradient(145deg, #FFFFFF 0%, #FEE2E2 100%)'
      }}>
        <Avatar sx={{ 
          m: '0 auto', 
          mb: 2,
          background: 'linear-gradient(135deg, #EF4444, #DC2626)', 
          width: 64, 
          height: 64,
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
          animation: 'scaleIn 0.6s ease-out'
        }}>
          <ErrorIcon sx={{ fontSize: 36 }} />
        </Avatar>
        <DialogTitle 
          id="error-dialog-title" 
          sx={{ 
            fontWeight: 700,
            color: 'error.main',
            fontSize: '1.5rem'
          }}
        >
          {title}
        </DialogTitle>
      </Box>
      <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
        <DialogContentText 
          id="error-dialog-description"
          sx={{ fontSize: '1rem', color: 'text.secondary' }}
        >
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button 
          onClick={onClose} 
          autoFocus 
          variant="contained" 
          color="error"
          sx={{
            borderRadius: '12px',
            px: 4,
            py: 1.2,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
            '&:hover': {
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.35)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
