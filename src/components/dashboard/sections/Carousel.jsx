import React, { useState, useEffect } from 'react';
import { handleApiError } from '@utils/errorHandler';
import { Box, Typography, Button, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TableCell, TableContainer, Table, TableHead, TableRow, Paper, TableBody, Snackbar, Alert } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Loading from '../../Loading';
import SecureErrorMessage from '../../common/SecureErrorMessage';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import { useNotification } from '@hooks/useNotification';
import { apiService } from '@services/apiService';
import { usePermissions } from '@hooks/usePermissions';
import i18nService from '@services/i18nService';
import { useLanguageThemeSync } from '@hooks/useLanguageThemeSync';
import AccessControl from '../../AccessControl';
import { logActivity, ActivityActions, EntityTypes } from '@utils/activityLogger';
import { API_URL } from '../../../config/apiConfig';
import logger from '@utils/logger';


const Carousel = () => {
    const [carouselModal, setCarouselModal] = useState(false);
    const [carouselImages, setCarouselImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);

    // Initialiser le service i18n et forcer le re-rendu sur changement de langue
    useEffect(() => {
        i18nService.init();
    }, []);
    const lastUpdate = useLanguageThemeSync();

    const {
        notification,
        showSuccess,
        showError,
        hideNotification
    } = useNotification();

    const {
        canCreateCarousel,
        canDeleteCarousel
    } = usePermissions();

    const loadCarouselImages = async () => {
        setLoading(true);
        try {
            const response = await apiService.carousel.getAll();
            setCarouselImages(response.data?.data || response.data || []);
            setError(null);
        } catch (err) {
            setError(processedError.message);
            setCarouselImages([]);
            const processedError = handleApiError(err, 'l\'opération');
            } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCarouselImages();
    }, []);

    const handleFileSelect = (event) => {
        logger.debug('handleFileSelect appelé', event);
        logger.debug('Fichiers sélectionnés:', event.target.files);
        
        const file = event.target.files[0];
        if (file) {
            logger.debug('Fichier sélectionné:', file.name, file.type, file.size);
            setSelectedFile(file);
        } else {
            logger.debug('Aucun fichier sélectionné');
        }
        
        // Réinitialiser la valeur pour permettre la sélection du même fichier
        event.target.value = '';
    };

    const handleUpload = async (event) => {
        if (event) event.preventDefault();
        
        // Validation personnalisée
        if (!selectedFile) {
            showError(i18nService.t('dashboard.carousel.noFileSelected') || 'Veuillez sélectionner une image');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const uploadedImage = await apiService.carousel.upload(formData);
            showSuccess(i18nService.t('dashboard.carousel.uploadSuccess'));
            
            // Log de l'activité
            await logActivity(
                ActivityActions.CREATE,
                EntityTypes.CAROUSEL,
                uploadedImage?.data?.id || uploadedImage?.data?._id,
                selectedFile.name,
                `Image carousel ajoutée: ${selectedFile.name}`
            );
            
            setCarouselModal(false);
            setSelectedFile(null);
            await loadCarouselImages();
        } catch (err) {
            showError(err.message || i18nService.t('dashboard.carousel.uploadError'));
        }
    };

    const handleDeleteImage = async () => {
        if (!imageToDelete) return;

        try {
            await apiService.carousel.delete(imageToDelete.id || imageToDelete._id);
            showSuccess(i18nService.t('dashboard.carousel.deleteSuccess'));
            
            // Log de l'activité
            await logActivity(
                ActivityActions.DELETE,
                EntityTypes.CAROUSEL,
                imageToDelete.id || imageToDelete._id,
                imageToDelete.image_url || 'Image carousel',
                `Image carousel supprimée: ${imageToDelete.image_url || 'sans nom'}`
            );
            
            await loadCarouselImages();
        } catch (err) {
            showError(err.message || i18nService.t('dashboard.carousel.deleteError'));
        } finally {
            setDeleteDialogOpen(false);
            setImageToDelete(null);
        }
    };

    const handleOpenDeleteDialog = (image) => {
        setImageToDelete(image);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setImageToDelete(null);
    };

    return (
        <AccessControl allowedRoles={['SUPER_ADMIN']}>
            <Box>
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
                    {i18nService.t('dashboard.carousel.title')}
                  </Typography>
                  <Box sx={{ 
                    width: 80, 
                    height: 4, 
                    background: 'linear-gradient(90deg, #662d91, #9e005d, #9e005d)',
                    borderRadius: 2
                  }} />
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCarouselModal(true)} disabled={!canCreateCarousel}>{i18nService.t('dashboard.carousel.newImage')}</Button>
            </Box>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <SecureErrorMessage error={error} title={i18nService.t('dashboard.carousel.loadingError')} />
            ) : (
                <TableContainer 
                  data-aos="fade-up" 
                  component={Paper}
                  elevation={0}
                  sx={{
                    borderRadius: '20px',
                    border: '2px solid rgba(102, 45, 145, 0.1)',
                    boxShadow: '0 10px 40px rgba(102, 45, 145, 0.08)',
                    overflow: 'hidden'
                  }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.carousel.table.image')}</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.carousel.table.path')}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.carousel.table.actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(carouselImages) && carouselImages.map((image) => (
                                <TableRow key={image.id || image._id}>
                                    <TableCell>
                                        <img
                                            src={`${API_URL.replace('/api', '')}${image.image_url}`}
                                            alt="Carousel"
                                            style={{ height: '50px', width: 'auto' }}
                                        />
                                    </TableCell>
                                    <TableCell>{image.image_url}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={() => handleOpenDeleteDialog(image)}
                                            color="error"
                                            size="small"
                                            disabled={!canDeleteCarousel}
                                            title={!canDeleteCarousel ? i18nService.t('dashboard.carousel.readOnlyAdmin') : ""}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {Array.isArray(carouselImages) && carouselImages.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        {i18nService.t('dashboard.carousel.noImages')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <Dialog
                open={carouselModal}
                onClose={() => setCarouselModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        width: '100%',
                        maxWidth: '500px',
                        margin: '20px'
                    }
                }}
            >
                <DialogTitle>{i18nService.t('dashboard.carousel.dialog.title')}</DialogTitle>
                <form onSubmit={handleUpload} noValidate>
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: '450px' }}>
                            {/* Méthode 1: Button avec component="label" */}
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ mt: 2, mb: 1 }}
                            >
                                {i18nService.t('dashboard.carousel.dialog.selectImage')}
                                <input
                                    id="carousel-image-input"
                                    type="file"
                                    name="carouselImage"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                            </Button>
                            {selectedFile && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 1 }} color="text.secondary">
                                        {selectedFile.name}
                                    </Typography>
                                    <Box sx={{ border: '1px solid #eee', borderRadius: 2, p: 1, bgcolor: '#fafafa' }}>
                                        <img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Prévisualisation"
                                            style={{ maxHeight: 120, maxWidth: 200, objectFit: 'contain' }}
                                        />
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCarouselModal(false)}>{i18nService.t('common.actions.cancel')}</Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={!selectedFile}
                        >
                            {i18nService.t('dashboard.carousel.dialog.create')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            {/* Dialog de confirmation suppression */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                title={i18nService.t('dashboard.carousel.deleteDialog.title')}
                content={imageToDelete ? i18nService.t('dashboard.carousel.deleteDialog.content', { imageUrl: imageToDelete.image_url }) : i18nService.t('dashboard.carousel.deleteDialog.contentGeneric')}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleDeleteImage}
            />

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
        </AccessControl>
    );
};

export default Carousel;
