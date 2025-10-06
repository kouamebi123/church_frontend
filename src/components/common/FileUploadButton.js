import React from 'react';
import { Button } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const FileUploadButton = ({ 
  onFileSelect, 
  accept = "image/*", 
  multiple = false,
  children = "Sélectionner une image",
  variant = "outlined",
  startIcon = <PhotoCamera />,
  sx = {},
  disabled = false,
  fullWidth = false
}) => {
  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (multiple) {
        onFileSelect(Array.from(files));
      } else {
        onFileSelect(files[0]);
      }
    }
    // Réinitialiser la valeur pour permettre la sélection du même fichier
    event.target.value = '';
  };

  return (
    <Button
      variant={variant}
      component="label"
      startIcon={startIcon}
      fullWidth={fullWidth}
      disabled={disabled}
      sx={sx}
    >
      {children}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        hidden
      />
    </Button>
  );
};

export default FileUploadButton;
