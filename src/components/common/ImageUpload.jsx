import React, { useRef } from 'react';
import { Button, Box } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const ImageUpload = ({ 
  onFileSelect, 
  accept = "image/*", 
  multiple = false,
  children = "Sélectionner une image",
  variant = "outlined",
  startIcon = <PhotoCamera />,
  sx = {},
  disabled = false
}) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
    <Box>
      <Button
        variant={variant}
        startIcon={startIcon}
        onClick={handleClick}
        disabled={disabled}
        sx={sx}
      >
        {children}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </Box>
  );
};

export default ImageUpload;
