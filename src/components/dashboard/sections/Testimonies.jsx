import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config/apiConfig';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Snackbar,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Note as NoteIcon,
  Group as GroupIcon,
  AttachFile as AttachFileIcon,
  StickyNote2 as StickyNote2Icon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useSelectedChurch } from '@hooks/useSelectedChurch';
import { useNotification } from '@hooks/useNotification';
import { formatDate } from '@utils/dateFormatter';
import { apiService } from '@services/apiService';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import { logActivity, ActivityActions, EntityTypes } from '@utils/activityLogger';
import logger from '@utils/logger';


const Testimonies = () => {
  logger.debug('Testimonies component rendering...');
  
  const { selectedChurch } = useSelectedChurch();
  const {
    notification,
    showSuccess,
    showError,
    hideNotification
  } = useNotification();
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [showOnlyWantsToTestify, setShowOnlyWantsToTestify] = useState(false);
  const [selectedTestimony, setSelectedTestimony] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonyToDelete, setTestimonyToDelete] = useState(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [testimonyForNote, setTestimonyForNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [testimonyToConfirm, setTestimonyToConfirm] = useState(null);

  // Catégories de témoignages (correspondant au schéma Prisma)
  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'INTIMACY', label: 'Intimité avec Dieu' },
    { value: 'LEADERSHIP', label: 'Leadership' },
    { value: 'HEALING', label: 'Guérison/Santé' },
    { value: 'PROFESSIONAL', label: 'Professionnel' },
    { value: 'BUSINESS', label: 'Entreprises/Affaires' },
    { value: 'FINANCES', label: 'Finances' },
    { value: 'DELIVERANCE', label: 'Délivrance' },
    { value: 'FAMILY', label: 'Famille' }
  ];

  // Charger les témoignages
  const loadTestimonies = async () => {
    logger.debug('loadTestimonies called, selectedChurch:', selectedChurch);
    if (!selectedChurch?.id) return;
    
    setLoading(true);
    
    try {
      const params = {
        page: page.toString(),
        limit: '10',
        churchId: selectedChurch.id
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (showOnlyUnread) params.isRead = 'false';
      if (showOnlyWantsToTestify) params.wantsToTestify = 'true';
      
      const response = await apiService.testimonies.getAll(params);
      const data = response.data;
      
      if (data.success) {
        setTestimonies(data.data.testimonies || []);
        setTotalPages(data.data.totalPages || 1);
      } else {
        showError(data.message || 'Erreur lors du chargement des témoignages');
      }
    } catch (err) {
      showError('Erreur de connexion lors du chargement des témoignages');
      logger.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les témoignages au montage et quand les filtres changent
  useEffect(() => {
    loadTestimonies();
  }, [selectedChurch, page, searchTerm, selectedCategory, showOnlyUnread, showOnlyWantsToTestify]);

  // Gestion de la pagination
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Gestion de la recherche
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset à la première page
  };

  // Gestion du filtre par catégorie
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPage(1); // Reset à la première page
  };

  // Gestion du filtre non lus
  const handleUnreadFilterChange = (event) => {
    setShowOnlyUnread(event.target.checked);
    setPage(1); // Reset à la première page
  };

  // Gestion du filtre témoignages de culte
  const handleWantsToTestifyFilterChange = (event) => {
    setShowOnlyWantsToTestify(event.target.checked);
    setPage(1); // Reset à la première page
  };

  // Voir un témoignage
  const handleViewTestimony = async (testimony) => {
    setSelectedTestimony(testimony);
    setViewDialogOpen(true);
    
    // Marquer automatiquement comme lu si ce n'est pas déjà fait
    if (!testimony.isRead) {
      try {
        await apiService.testimonies.markAsRead(testimony.id);
        // Recharger la liste pour mettre à jour l'affichage
        loadTestimonies();
      } catch (err) {
        logger.error('Erreur lors du marquage automatique comme lu:', err);
        // Ne pas afficher d'erreur à l'utilisateur pour cette action silencieuse
      }
    }
  };

  // Supprimer un témoignage
  const handleOpenDeleteDialog = (testimony) => {
    setTestimonyToDelete(testimony);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTestimonyToDelete(null);
  };

  const handleConfirmDeleteTestimony = async () => {
    if (!testimonyToDelete) return;

    try {
      const response = await apiService.testimonies.delete(testimonyToDelete.id);
      const data = response.data;

      if (data.success) {
        showSuccess('Témoignage supprimé avec succès');
        
        // Log de l'activité
        await logActivity(
          ActivityActions.DELETE,
          EntityTypes.TESTIMONY,
          testimonyToDelete.id,
          testimonyToDelete.title || 'Témoignage sans titre',
          `Témoignage supprimé: ${testimonyToDelete.title || 'sans titre'}`
        );
        
        loadTestimonies(); // Recharger la liste
      } else {
        showError(data.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      showError('Erreur de connexion lors de la suppression');
      logger.error('Erreur:', err);
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // Actualiser la liste
  const handleRefresh = () => {
    loadTestimonies();
  };

  // Confirmer pour le culte
  const handleConfirmForCulte = (testimony) => {
    setTestimonyToConfirm(testimony);
    setConfirmDialogOpen(true);
  };

  // Annuler la confirmation
  const handleCancelConfirmation = (testimony) => {
    setTestimonyToConfirm(testimony);
    setConfirmDialogOpen(true);
  };

  // Fermer le dialogue de confirmation
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setTestimonyToConfirm(null);
  };

  // Confirmer ou annuler la confirmation
  const handleConfirmTestimonyAction = async () => {
    if (!testimonyToConfirm) return;

    const isConfirming = !testimonyToConfirm.isConfirmedToTestify;

    try {
      const response = await apiService.testimonies.confirmForCulte(testimonyToConfirm.id, { confirmed: isConfirming });
      const data = response.data;

      if (data.success) {
        showSuccess(isConfirming ? 'Témoignage confirmé pour le culte' : 'Confirmation annulée');
        
        // Log de l'activité
        await logActivity(
          isConfirming ? ActivityActions.UPDATE : ActivityActions.UPDATE,
          EntityTypes.TESTIMONY,
          testimonyToConfirm.id,
          testimonyToConfirm.title || 'Témoignage sans titre',
          isConfirming ? 'Témoignage confirmé pour le culte' : 'Confirmation de culte annulée'
        );
        
        loadTestimonies(); // Recharger la liste
      } else {
        showError(data.message || 'Erreur lors de la confirmation');
      }
    } catch (err) {
      showError('Erreur de connexion lors de la confirmation');
      logger.error('Erreur:', err);
    } finally {
      handleCloseConfirmDialog();
    }
  };


  // Ouvrir le dialogue de note
  const handleOpenNoteDialog = (testimony) => {
    setTestimonyForNote(testimony);
    setNoteText(testimony.note || '');
    setNoteDialogOpen(true);
  };

  // Fermer le dialogue de note
  const handleCloseNoteDialog = () => {
    setNoteDialogOpen(false);
    setTestimonyForNote(null);
    setNoteText('');
  };

  // Sauvegarder la note
  const handleSaveNote = async () => {
    if (!testimonyForNote) return;

    try {
      const response = await apiService.testimonies.addNote(testimonyForNote.id, noteText);
      const data = response.data;

      if (data.success) {
        showSuccess(data.message);
        
        // Log de l'activité
        await logActivity(
          ActivityActions.UPDATE,
          EntityTypes.TESTIMONY,
          testimonyForNote.id,
          testimonyForNote.title || 'Témoignage sans titre',
          `Note ajoutée au témoignage: ${testimonyForNote.title || 'sans titre'}`
        );
        
        loadTestimonies(); // Recharger la liste
        handleCloseNoteDialog();
      } else {
        showError(data.message || 'Erreur lors de l\'ajout de la note');
      }
    } catch (err) {
      showError('Erreur de connexion lors de l\'ajout de la note');
      logger.error('Erreur:', err);
    }
  };

  // Formater le nom d'auteur (robuste)
  const formatAuthorName = (testimony) => {
    if (!testimony) return '—';
    if (testimony.isAnonymous) return 'Anonyme';
    return `${testimony.firstName ?? ''} ${testimony.lastName ?? ''}`.trim() || '—';
  };

  // Formater la catégorie (robuste)
  const formatCategory = (category) => {
    if (!category) return '—';
    const categoryObj = categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.label : String(category);
  };

  if (!selectedChurch) {
    return (
      <Alert severity="warning">
        Veuillez sélectionner une église pour voir les témoignages
      </Alert>
    );
  }

  return (
    <Box>
      {/* En-tête avec titre et bouton d'actualisation */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
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
            Gestion des témoignages
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
          onClick={handleRefresh}
          disabled={loading}
        >
          Actualiser
        </Button>
      </Box>

      {/* Filtres */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 3,
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
          border: '2px solid rgba(102, 45, 145, 0.1)',
          boxShadow: '0 10px 40px rgba(102, 45, 145, 0.08)'
        }}
      >
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontWeight: 700, 
              color: 'primary.main' 
            }}
          >
            <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filtres
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6} sx={{ width: '35%'}}>
              <TextField
                fullWidth
                id="testimonies-search"
                name="search"
                placeholder="Rechercher dans les témoignages..."
                value={searchTerm}
                onChange={handleSearchChange}
                autoComplete="off"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ width: '35%'}}>
              <FormControl fullWidth>
                <InputLabel id="testimonies-category-label">Catégorie</InputLabel>
                <Select
                  id="testimonies-category"
                  name="category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label="Catégorie"
                  labelId="testimonies-category-label"
                  autoComplete="off"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="testimonies-unread-only"
                    name="unreadOnly"
                    checked={showOnlyUnread}
                    onChange={handleUnreadFilterChange}
                    color="primary"
                  />
                }
                label="Non lus uniquement"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="testimonies-wants-to-testify"
                    name="wantsToTestify"
                    checked={showOnlyWantsToTestify}
                    onChange={handleWantsToTestifyFilterChange}
                    color="primary"
                  />
                }
                label="Veut témoigner au culte"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" justifyContent="center">
                <Chip
                  label={`${testimonies.length} témoignage(s)`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Liste des témoignages */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : testimonies.length === 0 ? (
        <Alert severity="info">
          Aucun témoignage trouvé pour cette église.
        </Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            {testimonies.map((testimony) => (
              <Grid item xs={12} md={6} lg={4} key={testimony.id} sx={{ width: '100%'}}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    opacity: testimony.isRead ? 0.7 : 1,
                    borderRadius: '20px',
                    background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                    border: testimony.isRead ? '2px solid rgba(102, 45, 145, 0.05)' : '2px solid rgba(102, 45, 145, 0.2)',
                    boxShadow: testimony.isRead ? '0 4px 12px rgba(102, 45, 145, 0.03)' : '0 8px 24px rgba(102, 45, 145, 0.12)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 36px rgba(102, 45, 145, 0.18)'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" gap={1} alignItems="center">
                        <Chip
                          label={formatCategory(testimony.category)}
                          color="primary"
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.primary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        {formatDate(testimony.createdAt)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      {formatAuthorName(testimony)}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.primary" 
                      sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2
                      }}
                    >
                      {testimony.content}
                    </Typography>
                    
                    {testimony.note && (
                      <Box sx={{ 
                        bgcolor: 'var(--testimony-accent-bg)', 
                        p: 2, 
                        borderRadius: 2, 
                        mb: 2,
                        border: '1px solid',
                        borderColor: 'var(--testimony-accent-border)',
                        position: 'relative'
                      }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Box sx={{ 
                            width: 20, 
                            height: 20, 
                            borderRadius: '50%', 
                            bgcolor: 'primary.main', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                        <StickyNote2Icon sx={{ color: 'white', fontSize: '16px' }} />
                          </Box>
                          <Typography variant="subtitle2" color="primary.dark" sx={{ fontWeight: 600 }}>
                            Note
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.primary" sx={{ 
                          lineHeight: 1.6,
                          fontStyle: 'italic',
                          pl: 3
                        }}>
                          {testimony.note}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Chips d'information */}
                    <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
                      {testimony.network?.nom && (
                        <Chip
                          icon={<GroupIcon />}
                          label={`Réseau : ${testimony.network.nom}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                      
                      {testimony.illustrations?.length > 0 && (
                        <Chip
                          icon={<AttachFileIcon />}
                          label={`${testimony.illustrations.length} fichier(s)`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                      
                      {testimony.wantsToTestify && (
                        <Chip
                          label="Veut témoigner au culte"
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      )}
                      
                      {testimony.isConfirmedToTestify && (
                        <Chip
                          label="Confirmé pour culte"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      )}
                      
                      {testimony.hasTestified && (
                        <Chip
                          label="A témoigné"
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      )}
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" gap={1}>
                        <Tooltip title="Voir le témoignage">
                          <IconButton
                            size="small"
                            onClick={() => handleViewTestimony(testimony)}
                            sx={{
                              color: testimony.isRead ? 'var(--testimony-read)' : 'var(--testimony-unread)',
                              '&:hover': {
                                backgroundColor: testimony.isRead ? 'var(--testimony-read-bg)' : 'var(--testimony-unread-bg)'
                              }
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {/* Bouton pour confirmer pour le culte (si pas anonyme et pas encore confirmé) */}
                        {!testimony.isAnonymous && !testimony.isConfirmedToTestify && (
                          <Tooltip title="Confirmer pour le culte">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleConfirmForCulte(testimony)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {/* Bouton pour annuler la confirmation */}
                        {testimony.isConfirmedToTestify && (
                          <Tooltip title="Annuler la confirmation">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCancelConfirmation(testimony)}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title={testimony.note ? "Modifier la note" : "Ajouter une note"}>
                          <IconButton
                            size="small"
                            color={testimony.note ? "primary" : "default"}
                            onClick={() => handleOpenNoteDialog(testimony)}
                          >
                            <NoteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(testimony)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Dialog pour voir un témoignage */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(102, 45, 145, 0.15)',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(102, 45, 145, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Témoignage de {selectedTestimony && formatAuthorName(selectedTestimony)}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedTestimony && (
              <Box>
                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={formatCategory(selectedTestimony.category)}
                    color="primary"
                    size="small"
                  />
                </Box>
                
                <Typography variant="body1" paragraph>
                  {selectedTestimony.content}
                </Typography>
                
                {/* Informations de contact */}
                {(selectedTestimony.phone || selectedTestimony.email) && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Informations de contact :
                    </Typography>
                    {selectedTestimony.phone && (
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{selectedTestimony.phone}</Typography>
                      </Box>
                    )}
                    {selectedTestimony.email && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">{selectedTestimony.email}</Typography>
                      </Box>
                    )}
                  </Box>
                )}
                
                {selectedTestimony.network?.nom && (
                  <Chip
                    icon={<GroupIcon />}
                    label={`Réseau : ${selectedTestimony.network.nom}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 2, fontSize: '0.75rem' }}
                  />
                )}
                
                {selectedTestimony.illustrations?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={<AttachFileIcon />}
                      label={`${selectedTestimony.illustrations.length} fichier(s) joint(s)`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ mb: 1, fontSize: '0.75rem' }}
                    />
                    <Box sx={{ mt: 1 }}>
                      {selectedTestimony.illustrations.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.originalName}
                          icon={<DownloadIcon />}
                          clickable
                          onClick={() => window.open(`${API_BASE_URL}/uploads/testimonies/${file.fileName}`, '_blank')}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation suppression */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Supprimer le témoignage"
        content={testimonyToDelete ? `Êtes-vous sûr de vouloir supprimer le témoignage "${testimonyToDelete.title || 'sans titre'}" ?` : "Êtes-vous sûr de vouloir supprimer ce témoignage ?"}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeleteTestimony}
      />

      {/* Dialog pour les notes */}
      <Dialog 
        open={noteDialogOpen} 
        onClose={handleCloseNoteDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(102, 45, 145, 0.15)',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(102, 45, 145, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {testimonyForNote?.note ? 'Modifier la note' : 'Ajouter une note'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {testimonyForNote && (
              <Typography variant="body2" color="text.primary" gutterBottom>
                Témoignage de {formatAuthorName(testimonyForNote)} - {formatCategory(testimonyForNote.category)}
              </Typography>
            )}
            <TextField
              fullWidth
              multiline
              rows={6}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ajoutez votre note sur ce témoignage..."
              variant="outlined"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoteDialog}>
            Annuler
          </Button>
          {testimonyForNote?.note && (
            <Button 
              onClick={async () => {
                setNoteText('');
                try {
                  const response = await apiService.testimonies.addNote(testimonyForNote.id, '');
                  const data = response.data;
                  if (data.success) {
                    showSuccess(data.message);
                    loadTestimonies();
                    handleCloseNoteDialog();
                  } else {
                    showError(data.message || 'Erreur lors de la suppression de la note');
                  }
                } catch (err) {
                  showError('Erreur de connexion lors de la suppression de la note');
                  logger.error('Erreur:', err);
                }
              }}
              color="error"
            >
              Supprimer la note
            </Button>
          )}
          <Button 
            onClick={handleSaveNote} 
            variant="contained"
            disabled={!noteText.trim()}
          >
            {testimonyForNote?.note ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation pour le culte */}
      <Dialog 
        open={confirmDialogOpen} 
        onClose={handleCloseConfirmDialog}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(102, 45, 145, 0.15)',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(102, 45, 145, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 700,
          background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {testimonyToConfirm?.isConfirmedToTestify ? 'Annuler la confirmation' : 'Confirmer pour le culte'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {testimonyToConfirm?.isConfirmedToTestify 
              ? 'Êtes-vous sûr de vouloir annuler la confirmation de ce témoignage pour le culte ?'
              : 'Êtes-vous sûr de vouloir confirmer ce témoignage pour le culte ?'
            }
          </Typography>
          {testimonyToConfirm && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {formatAuthorName(testimonyToConfirm)} - {formatCategory(testimonyToConfirm.category)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmTestimonyAction}
            variant="contained"
            color={testimonyToConfirm?.isConfirmedToTestify ? "error" : "primary"}
          >
            {testimonyToConfirm?.isConfirmedToTestify ? 'Annuler la confirmation' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={hideNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Testimonies;
