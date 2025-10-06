import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

const SuccessDialog = ({ open, onClose, title = 'Succès', content = 'L\'opération a réussi.' }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="success-dialog-title"
      aria-describedby="success-dialog-description"
    >
      <DialogTitle id="success-dialog-title" sx={{ color: 'success.main' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="success-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus variant="contained" color="success">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuccessDialog;
