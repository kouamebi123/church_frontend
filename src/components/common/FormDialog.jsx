import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';

const FormDialog = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Enregistrer',
  cancelText = 'Annuler',
  loading = false,
  maxWidth = 'sm',
  fullWidth = true,
  submitDisabled = false,
  showCancel = true,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && !loading && !submitDisabled) {
      onSubmit(e);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(102, 45, 145, 0.15)',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(102, 45, 145, 0.1)'
        }
      }}
      {...props}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Typography 
            variant="h5" 
            component="div"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {title}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box py={1}>
            {children}
          </Box>
        </DialogContent>

        <DialogActions>
          {showCancel && (
            <Button
              onClick={onClose}
              disabled={loading}
              color="inherit"
            >
              {cancelText}
            </Button>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading || submitDisabled}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {submitText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FormDialog;