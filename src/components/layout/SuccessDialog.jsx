import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box, Avatar } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

const SuccessDialog = ({ open, onClose, title = 'Succès', content = 'L\'opération a réussi.' }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="success-dialog-title"
      aria-describedby="success-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(16, 185, 129, 0.15)',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ 
        textAlign: 'center', 
        pt: 4,
        background: 'linear-gradient(145deg, #FFFFFF 0%, #ECFDF5 100%)'
      }}>
        <Avatar sx={{ 
          m: '0 auto', 
          mb: 2,
          background: 'linear-gradient(135deg, #10B981, #059669)', 
          width: 64, 
          height: 64,
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
          animation: 'scaleIn 0.6s ease-out'
        }}>
          <CheckCircle sx={{ fontSize: 36 }} />
        </Avatar>
        <DialogTitle 
          id="success-dialog-title" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #10B981, #059669)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.5rem'
          }}
        >
          {title}
        </DialogTitle>
      </Box>
      <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
        <DialogContentText 
          id="success-dialog-description"
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
          color="success"
          sx={{
            borderRadius: '12px',
            px: 4,
            py: 1.2,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #10B981, #059669)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669, #047857)',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
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

export default SuccessDialog;
