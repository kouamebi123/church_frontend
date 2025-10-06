import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

const ErrorDialog = ({ open, onClose, title = 'Erreur', content = 'Une erreur est survenue.' }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-description"
    >
      <DialogTitle id="error-dialog-title" sx={{ color: 'error.main' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="error-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus variant="contained" color="error">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
