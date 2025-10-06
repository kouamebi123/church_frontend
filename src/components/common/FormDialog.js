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
      {...props}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Typography variant="h6" component="div">
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