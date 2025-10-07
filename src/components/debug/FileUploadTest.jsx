import React, { useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const FileUploadTest = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleFileSelect1 = (event) => {
    addLog('Méthode 1 - handleFileSelect appelé');
    addLog(`Fichiers: ${event.target.files.length}`);
    
    const file = event.target.files[0];
    if (file) {
      addLog(`Fichier sélectionné: ${file.name} (${file.type}, ${file.size} bytes)`);
      setSelectedFile(file);
    }
    event.target.value = '';
  };

  const handleFileSelect2 = (event) => {
    addLog('Méthode 2 - handleFileSelect appelé');
    addLog(`Fichiers: ${event.target.files.length}`);
    
    const file = event.target.files[0];
    if (file) {
      addLog(`Fichier sélectionné: ${file.name} (${file.type}, ${file.size} bytes)`);
      setSelectedFile(file);
    }
    event.target.value = '';
  };

  const handleClick = () => {
    addLog('Bouton cliqué - tentative d\'ouverture du gestionnaire de fichiers');
    const input = document.getElementById('test-file-input');
    if (input) {
      addLog('Input trouvé, déclenchement du click');
      input.click();
    } else {
      addLog('ERREUR: Input non trouvé');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Test d'Upload de Fichiers - Diagnostic
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Cette page teste différentes méthodes d'upload de fichiers pour diagnostiquer le problème.
      </Alert>

      {/* Méthode 1: Button avec component="label" */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Méthode 1: Button avec component="label"</Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<PhotoCamera />}
          sx={{ mb: 2 }}
        >
          Sélectionner une image (Méthode 1)
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileSelect1}
          />
        </Button>
      </Box>

      {/* Méthode 2: Input visible */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Méthode 2: Input visible</Typography>
        <input
          id="file-upload-test-visible"
          name="file"
          type="file"
          accept="image/*"
          onChange={handleFileSelect2}
          style={{ width: '100%', marginBottom: '16px' }}
        />
      </Box>

      {/* Méthode 3: JavaScript click */}
      <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Méthode 3: JavaScript click</Typography>
        <Button
          variant="outlined"
          startIcon={<PhotoCamera />}
          onClick={handleClick}
          sx={{ mb: 2 }}
        >
          Sélectionner une image (Méthode 3)
        </Button>
        <input
          id="test-file-input"
          name="file"
          type="file"
          accept="image/*"
          onChange={handleFileSelect1}
          style={{ display: 'none' }}
        />
      </Box>

      {/* Résultats */}
      {selectedFile && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Fichier sélectionné avec succès: {selectedFile.name} ({selectedFile.type}, {selectedFile.size} bytes)
        </Alert>
      )}

      {/* Logs */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>Logs de diagnostic:</Typography>
        <Box sx={{ 
          maxHeight: 200, 
          overflow: 'auto', 
          border: '1px solid #ddd', 
          p: 1, 
          bgcolor: '#f5f5f5',
          fontFamily: 'monospace',
          fontSize: '0.875rem'
        }}>
          {logs.length === 0 ? (
            <Typography color="text.secondary">Aucun log pour le moment...</Typography>
          ) : (
            logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FileUploadTest;
