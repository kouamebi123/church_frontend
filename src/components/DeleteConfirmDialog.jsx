import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import i18nService from '@services/i18nService';

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  content
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(239, 68, 68, 0.15)',
          border: '2px solid rgba(239, 68, 68, 0.1)'
        }
      }}
    >
      <DialogTitle 
        id="alert-dialog-title"
        sx={{
          fontWeight: 700,
          color: 'error.main',
          fontSize: '1.3rem',
          pt: 3
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <DialogContentText 
          id="alert-dialog-description"
          sx={{ fontSize: '1rem', color: 'text.secondary' }}
        >
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          sx={{
            borderRadius: '12px',
            px: 3,
            fontWeight: 600
          }}
        >
          {i18nService.t('common.actions.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          autoFocus
          sx={{
            borderRadius: '12px',
            px: 3,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
            '&:hover': {
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.35)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          {i18nService.t('common.actions.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
