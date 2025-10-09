import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Snackbar
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import i18nService from '@services/i18nService';
import previsionnelService from '@services/previsionnelService';
import assistanceService from '@services/assistanceService';
import logger from '@utils/logger';


const HistoriqueCulteModal = ({ 
  open, 
  onClose, 
  networkData
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previsionnels, setPrevisionnels] = useState([]);
  const [assistances, setAssistances] = useState([]);
  const [error, setError] = useState(null);
  
  // États pour la confirmation de suppression
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: null, // 'previsionnel' ou 'assistance'
    item: null,
    title: '',
    content: ''
  });

  // États pour le Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });

  // Charger l'historique au montage du composant
  useEffect(() => {
    if (open && networkData?.reseau?.id) {
      loadHistorique();
    }
  }, [open, networkData]);

  // Gérer le focus quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      // Attendre que le DOM soit mis à jour
      const timer = setTimeout(() => {
        const dialogElement = document.querySelector('[role="dialog"]');
        if (dialogElement) {
          dialogElement.focus();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  const loadHistorique = async () => {
    if (!networkData?.reseau?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Charger les prévisionnels
      const previsionnelsRes = await previsionnelService.getStats({
        network_id: networkData.reseau.id,
        limit: 50 // Limiter à 50 entrées récentes
      });
      
      // Charger l'assistance
      const assistancesRes = await assistanceService.getStats({
        network_id: networkData.reseau.id,
        limit: 50
      });
      
      // Les données sont dans .details, pas dans .data
      const previsionnelsData = previsionnelsRes.data?.details || previsionnelsRes.data?.data || [];
      const assistancesData = assistancesRes.data?.details || assistancesRes.data?.data || [];
      

      
      setPrevisionnels(previsionnelsData);
      setAssistances(assistancesData);
      
    } catch (error) {
      logger.error('Erreur lors du chargement de l\'historique:', error);
      setError(i18nService.t('history.loadingError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    
    try {
      if (deleteDialog.type === 'previsionnel') {
        // Utiliser l'ID comme identifiant unique
        const itemId = deleteDialog.item.id;
        if (!itemId) {
          setSnackbar({
            open: true,
            message: 'ID du prévisionnel manquant',
            severity: 'error'
          });
          return;
        }
        
        await previsionnelService.delete(itemId);
        setPrevisionnels(prev => prev.filter(p => p.id !== itemId));
        
        // Afficher le message de succès
        setSnackbar({
          open: true,
          message: i18nService.t('history.deletePrevisionnelSuccess'),
          severity: 'success'
        });
      } else if (deleteDialog.type === 'assistance') {
        // Utiliser l'ID comme identifiant unique
        const itemId = deleteDialog.item.id;
        if (!itemId) {
          setSnackbar({
            open: true,
            message: 'ID de l\'assistance manquant',
            severity: 'error'
          });
          return;
        }
        
        await assistanceService.delete(itemId);
        setAssistances(prev => prev.filter(a => a.id !== itemId));
        
        // Afficher le message de succès
        setSnackbar({
          open: true,
          message: i18nService.t('history.deleteAssistanceSuccess'),
          severity: 'success'
        });
      }
      
      setDeleteDialog({ open: false, type: null, item: null, title: '', content: '' });
      
    } catch (error) {
      logger.error('❌ Erreur lors de la suppression:', error);
      
      // Afficher le message d'erreur
      setSnackbar({
        open: true,
        message: i18nService.t('history.deleteError'),
        severity: 'error'
      });
    }
  };

  const openDeleteDialog = (type, item) => {
    const isPrevisionnel = type === 'previsionnel';
    const date = format(new Date(item.date), 'dd/MM/yyyy', { locale: fr });
    const typeCulte = item.type_culte || i18nService.t('history.defaultCulteType');
    
    setDeleteDialog({
      open: true,
      type,
      item,
      title: `Supprimer ${isPrevisionnel ? 'le prévisionnel' : 'l\'assistance'}`,
      content: `Êtes-vous sûr de vouloir supprimer ${isPrevisionnel ? 'le prévisionnel' : 'l\'assistance'} du ${date} (${typeCulte}) ?`
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const getTypeCulteLabel = (type) => {
    const types = {
      'CULTE_DIMANCHE': i18nService.t('previsionnel.form.typeCulte.dimanche'),
      'CULTE_MERCREDI': i18nService.t('previsionnel.form.typeCulte.mercredi'),
      'CULTE_VENDREDI': i18nService.t('previsionnel.form.typeCulte.vendredi'),
      'CULTE_SPECIAL': i18nService.t('previsionnel.form.typeCulte.special'),
      'REUNION_PRIERE': i18nService.t('previsionnel.form.typeCulte.reunionPriere'),
      'ETUDE_BIBLIQUE': i18nService.t('previsionnel.form.typeCulte.etudeBiblique')
    };
    return types[type] || type;
  };

  const renderPrevisionnelCard = (previsionnel) => (
    <Card sx={{ 
      mb: 1.5, 
      borderRadius: '16px',
      border: '2px solid rgba(102, 45, 145, 0.1)',
      background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
      boxShadow: '0 4px 12px rgba(102, 45, 145, 0.08)',
      transition: 'all 0.3s ease',
      '&:hover': { 
        boxShadow: '0 8px 24px rgba(102, 45, 145, 0.15)',
        transform: 'translateY(-2px)'
      } 
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarIcon color="primary" sx={{ fontSize: '1.2rem' }} />
            <Box>
              <Typography variant="subtitle1" color="primary" sx={{ fontSize: '1rem' }}>
                {formatDate(previsionnel.date)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                <Chip 
                  label={getTypeCulteLabel(previsionnel.type_culte)} 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                  sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}
                />
                <Chip 
                  label={`${i18nService.t('previsionnel.form.totalMembres')} : ${previsionnel.previsionnel || previsionnel.total_previsionnel || 0}`}
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                  sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}
                />
              </Box>
            </Box>
          </Box>
          
                    <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={i18nService.t('common.actions.delete')}>
              <IconButton 
                color="error" 
                size="small"
                onClick={() => openDeleteDialog('previsionnel', previsionnel)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderAssistanceCard = (assistance) => (
    <Card key={assistance.id} sx={{ 
      mb: 1.5, 
      borderRadius: '16px',
      border: '2px solid rgba(16, 185, 129, 0.1)',
      background: 'linear-gradient(145deg, #FFFFFF 0%, #ECFDF5 100%)',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
      transition: 'all 0.3s ease',
      '&:hover': { 
        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
        transform: 'translateY(-2px)'
      } 
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarIcon color="success" sx={{ fontSize: '1.2rem' }} />
            <Box>
              <Typography variant="subtitle1" color="success.main" sx={{ fontSize: '1rem' }}>
                {formatDate(assistance.date)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                <Chip 
                  label={getTypeCulteLabel(assistance.type_culte)} 
                  color="success" 
                  variant="outlined" 
                  size="small" 
                  sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}
                />
                <Chip 
                  label={`${i18nService.t('previsionnel.form.totalMembres')} : ${assistance.effectif_reel || assistance.total_presents || 0}`}
                  color="success" 
                  variant="outlined" 
                  size="small" 
                  sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}
                />
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={i18nService.t('common.actions.delete')}>
              <IconButton 
                color="error" 
                size="small"
                onClick={() => openDeleteDialog('assistance', assistance)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }

    if (activeTab === 0) {
      // Onglet Prévisionnels
      if (!Array.isArray(previsionnels) || previsionnels.length === 0) {
        return (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <TrendingUpIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {i18nService.t('previsionnel.dashboard.noData')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {i18nService.t('previsionnel.dashboard.noDataDescription')}
            </Typography>
          </Box>
        );
      }

      return (
        <Box sx={{ p: 2 }}>
          {previsionnels.map((previsionnel, index) => (
            <div key={previsionnel.id || `${previsionnel.date}-${previsionnel.type_culte}-${index}`}>
              {renderPrevisionnelCard(previsionnel)}
            </div>
          ))}
        </Box>
      );
    } else {
      // Onglet Assistance
      if (!Array.isArray(assistances) || assistances.length === 0) {
        return (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {i18nService.t('assistance.dashboard.noData')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {i18nService.t('assistance.dashboard.noDataDescription')}
            </Typography>
          </Box>
        );
      }

      return (
        <Box sx={{ p: 2 }}>
          {assistances.map((assistance, index) => (
            <div key={assistance.id || `${assistance.date}-${assistance.type_culte}-${index}`}>
              {renderAssistanceCard(assistance)}
            </div>
          ))}
        </Box>
      );
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        disableEscapeKeyDown={false}
        disableRestoreFocus={false}
        keepMounted={false}
        PaperProps={{
          sx: { 
            minHeight: '70vh',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(102, 45, 145, 0.15)',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(102, 45, 145, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '2px solid rgba(102, 45, 145, 0.1)',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="h5" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontWeight: 700,
                background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              <HistoryIcon sx={{ color: '#662d91' }} />
              {i18nService.t('home.historyOfCultes')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={i18nService.t('common.actions.refresh')}>
                <IconButton onClick={loadHistorique} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: -1 }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon fontSize="small" />
                    {i18nService.t('home.previsions')} ({Array.isArray(previsionnels) ? previsionnels.length : 0})
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon fontSize="small" />
                    {i18nService.t('home.assistance')} ({Array.isArray(assistances) ? assistances.length : 0})
                  </Box>
                } 
              />
            </Tabs>
          </Box>
          
          {renderTabContent()}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} color="primary">
              {i18nService.t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: null, item: null, title: '', content: '' })}
        disableEscapeKeyDown={false}
        disableRestoreFocus={false}
        keepMounted={false}
      >
        <DialogTitle>{deleteDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{deleteDialog.content}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, type: null, item: null, title: '', content: '' })}
          >
            {i18nService.t('common.actions.cancel')}
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
          >
            {i18nService.t('common.actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </>
  );
};

export default HistoriqueCulteModal;
