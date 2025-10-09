import React, { useEffect, useState, useCallback } from 'react';
import { handleApiError } from '@utils/errorHandler';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { apiService } from '@services/apiService';
import { formatQualificationWithFallback } from '@utils/qualificationFormatter';
import '../../../styles/dashboardSections.css';

const UsersRetired = ({ selectedChurch }) => {
  // Debug: afficher la valeur de selectedChurch
  // Debug de l'église sélectionnée - Supprimé pour la production

  const [retired, setRetired] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRetired = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = selectedChurch ? { churchId: selectedChurch.id } : {};
      const res = await apiService.users.getRetired(params);
      setRetired(res.data?.data || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedChurch]);

  // Charger les données quand selectedChurch change
  useEffect(() => {
    if (selectedChurch) {
      fetchRetired();
    }
  }, [selectedChurch, fetchRetired]); // Dependencies updated

  // Protection : ne pas afficher les données si selectedChurch n'est pas valide
  if (!selectedChurch) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Veuillez sélectionner une église pour voir les membres retraités
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800,
            background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Membres Retirés
        </Typography>
        <Box sx={{ 
          width: 80, 
          height: 4, 
          background: 'linear-gradient(90deg, #662d91, #9e005d, #9e005d)',
          borderRadius: 2
        }} />
      </Box>
      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : retired.length === 0 ? (
        <Typography>Aucun membre retiré trouvé.</Typography>
      ) : (
        <TableContainer 
          data-aos="fade-up" 
          component={Paper} 
          elevation={0}
          sx={{ 
            mt: 2,
            borderRadius: '20px',
            border: '2px solid rgba(102, 45, 145, 0.1)',
            boxShadow: '0 10px 40px rgba(102, 45, 145, 0.08)',
            overflow: 'hidden'
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>Pseudo</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>Qualification</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>Groupe quitté</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>Réseau</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>Date de sortie</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {retired.map((item, idx) => (
                <TableRow key={item.user._id} sx={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff', '&:hover': { backgroundColor: '#e3f2fd' } }}>
                  <TableCell>{item.user.username}</TableCell>
                  <TableCell>{item.user.pseudo}</TableCell>
                  <TableCell>{formatQualificationWithFallback(item.user.qualification, '-')}</TableCell>
                  <TableCell>{item.group?.nom || '-'}</TableCell>
                  <TableCell>{item.network?.nom || '-'}</TableCell>
                  <TableCell>{item.leftAt ? new Date(item.leftAt).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default UsersRetired;
