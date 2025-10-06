import React, { useEffect, useState, useCallback } from 'react';
import { handleApiError } from '../../../utils/errorHandler';
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
import { apiService } from '../../../services/apiService';
import { formatQualificationWithFallback } from '../../../utils/qualificationFormatter';

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Membres Retirés</Typography>
      </Box>
      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : retired.length === 0 ? (
        <Typography>Aucun membre retiré trouvé.</Typography>
      ) : (
        <TableContainer  data-aos="fade-up" component={Paper} sx={{ mt: 2, boxShadow: 3, borderRadius: 2 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Pseudo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Qualification</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Groupe quitté</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Réseau</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Date de sortie</TableCell>
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
