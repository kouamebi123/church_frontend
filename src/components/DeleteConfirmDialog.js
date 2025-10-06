import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import i18nService from '../services/i18nService';

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
    >
      <DialogTitle id="alert-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{i18nService.t('common.actions.cancel')}</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          autoFocus
        >
          {i18nService.t('common.actions.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
