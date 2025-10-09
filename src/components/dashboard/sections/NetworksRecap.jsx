import React, { useEffect, useState, useCallback } from 'react';
import { handleApiError } from '@utils/errorHandler';
import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Button } from '@mui/material';
import { apiService } from '@services/apiService';
import i18nService from '@services/i18nService';
import { formatQualification } from '@utils/qualificationFormatter';
import RefreshIcon from '@mui/icons-material/Refresh';

const NetworksRecap = ({ selectedChurch, user, refreshKey }) => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNetworks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = selectedChurch ? { churchId: selectedChurch.id } : {};
      
      const res = await apiService.stats.getNetworks(params);
      
      const data = res.data?.data || res.data || [];
      
      if (Array.isArray(data)) {
        setNetworks(data);
      } else {
        setNetworks([]);
      }
    } catch (err) {
      const processedError = handleApiError(err, 'networksrecap - erreur:');
            ;
      setError(processedError.message);
      setNetworks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedChurch]);

  // Charger les données quand selectedChurch change
  useEffect(() => {
    if (selectedChurch) {
      fetchNetworks();
    }
  }, [selectedChurch, fetchNetworks]); // Dependencies updated

  // Protection : ne pas afficher les données si selectedChurch n'est pas valide
  if (!selectedChurch) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <Typography variant="h6" color="text.secondary">
          {i18nService.t('dashboard.networks.selectChurchMessage')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      overflow: 'hidden',
      overflowX: 'auto'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Box>
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
            {i18nService.t('dashboard.networks.recap.title')}
          </Typography>
          <Box sx={{ 
            width: 80, 
            height: 4, 
            background: 'linear-gradient(90deg, #662d91, #9e005d, #9e005d)',
            borderRadius: 2
          }} />
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchNetworks}
          disabled={loading}
        >
          {loading ? i18nService.t('common.actions.loading') : i18nService.t('dashboard.networks.recap.refresh')}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : networks.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {i18nService.t('dashboard.networks.noNetworks')}
          </Typography>
        </Box>
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
          <Table sx={{ minWidth: 650 }} stickyHeader>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%) !important' }}>
                <TableCell sx={{ fontWeight: 700, color: 'white !important', background: 'transparent !important' }}>{i18nService.t('dashboard.networks.recap.table.networkName')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'white !important', background: 'transparent !important' }}>{i18nService.t('dashboard.networks.recap.table.totalMembers')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'white !important', background: 'transparent !important' }}>{i18nService.t('dashboard.networks.recap.table.nb12')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'white !important', background: 'transparent !important' }}>{i18nService.t('dashboard.networks.recap.table.nb144')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'white !important', background: 'transparent !important' }}>{i18nService.t('dashboard.networks.recap.table.groupCount')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'white !important', background: 'transparent !important' }}>{i18nService.t('dashboard.networks.recap.table.groupResponsablesCount')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {networks.map((n, idx) => (
                <TableRow
                  key={n.id || n.nom}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff',
                    '&:hover': { backgroundColor: '#e3f2fd' },
                    borderBottom: '1px solid #e0e0e0',
                  }}
                >
                  <TableCell sx={{ py: 1, px: 2 }}>{n.nom}</TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 2 }}>{n.memberCount || 0}</TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 2 }}>
                    {n.qualifications?.filter(q => formatQualification(q) === '12').length || 0}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 2 }}>
                    {n.qualifications?.filter(q => formatQualification(q) === '144').length || 0}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 2 }}>{n.groupCount || 0}</TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 2 }}>{n.groupResponsablesCount || 0}</TableCell>
                </TableRow>
              ))}
              {/* Ligne Totaux */}
              {networks.length > 0 && (() => {
                const totals = networks.reduce((acc, n) => {
                  acc.memberCount += n.memberCount || 0;
                  acc.nb12 += n.qualifications?.filter(q => formatQualification(q) === '12').length || 0;
                  acc.nb144 += n.qualifications?.filter(q => formatQualification(q) === '144').length || 0;
                  acc.groupCount += n.groupCount || 0;
                  acc.groupResponsablesCount += n.groupResponsablesCount || 0;
                  return acc;
                }, { memberCount: 0, nb12: 0, nb144: 0, groupCount: 0, groupResponsablesCount: 0 });
                
                return (
                  <TableRow sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                    <TableCell sx={{ py: 1, px: 2, fontWeight: 'bold' }}>{i18nService.t('dashboard.networks.recap.table.totals')}</TableCell>
                    <TableCell align="right" sx={{ py: 1, px: 2, fontWeight: 'bold' }}>{totals.memberCount}</TableCell>
                    <TableCell align="right" sx={{ py: 1, px: 2, fontWeight: 'bold' }}>{totals.nb12}</TableCell>
                    <TableCell align="right" sx={{ py: 1, px: 2, fontWeight: 'bold' }}>{totals.nb144}</TableCell>
                    <TableCell align="right" sx={{ py: 1, px: 2, fontWeight: 'bold' }}>{totals.groupCount}</TableCell>
                    <TableCell align="right" sx={{ py: 1, px: 2, fontWeight: 'bold' }}>{totals.groupResponsablesCount}</TableCell>
                  </TableRow>
                );
              })()}

            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default NetworksRecap;
