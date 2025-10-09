import React, { useState, useEffect } from 'react';
import { handleApiError } from '@utils/errorHandler';
import { Typography, Box, IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl, CircularProgress, Autocomplete } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import Loading from '../../Loading';
import SecureErrorMessage from '../../common/SecureErrorMessage';
import { useNotification } from '@hooks/useNotification';
import { apiService } from '@services/apiService';
// debounce import supprimé car non utilisé
import { cityPopulations, getCityByName } from '@constants/cities';
import axios from 'axios';
import { usePermissions } from '@hooks/usePermissions';
import i18nService from '@services/i18nService';
import { useLanguageThemeSync } from '@hooks/useLanguageThemeSync';
import AccessControl from '../../AccessControl';
import { logActivity, ActivityActions, EntityTypes } from '@utils/activityLogger';

const Churches = () => {
    const [churches, setChurches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [churchModal, setChurchModal] = useState(false);
    const [editingChurchId, setEditingChurchId] = useState(null);
    const [churchForm, setChurchForm] = useState({ 
        nom: '', 
        adresse: '', 
        ville: '',
        latitude: '',
        longitude: '',
        population: '',
        description: '',
        responsable: '',
        type: 'EGLISE',
        image: null
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [churchToDelete, setChurchToDelete] = useState(null);
    const [users, setUsers] = useState([]);
    const [loadingCityInfo, setLoadingCityInfo] = useState(false);
    const [addressOptions, setAddressOptions] = useState([]);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [addressValue, setAddressValue] = useState(null);
    const [addressInputValue, setAddressInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

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
        canCreateChurches,
        canUpdateChurches,
        canDeleteChurches
    } = usePermissions();

    const loadChurches = async () => {
        setLoading(true);
        try {
            const response = await apiService.churches.getAll();
            setChurches(response.data?.data || response.data || []);
            setError(null);
        } catch (err) {
            const processedError = handleApiError(err, 'le chargement des églises');
            setError(processedError.message);
            setChurches([]);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            // Utiliser la nouvelle route spécifique pour les utilisateurs GOUVERNANCE
            const response = await apiService.users.getGovernance();
            const governanceUsers = response.data?.data || response.data || [];
            
            setUsers(governanceUsers);
        } catch (err) {
            // Gérer les erreurs de chargement des utilisateurs de manière plus intuitive
            let errorMessage = i18nService.t('dashboard.churches.loadResponsablesError');
            
            if (err.response?.status === 500) {
                errorMessage = i18nService.t('dashboard.churches.serverError');
            } else if (err.response?.status === 403) {
                errorMessage = i18nService.t('dashboard.churches.accessDenied');
            } else if (err.message && !err.message.includes('Request failed with status code')) {
                errorMessage = err.message;
            }
            
            setUsers([]);
        }
    };

    useEffect(() => {
        loadChurches();
        loadUsers();
    }, []);

    // Fonction pour récupérer automatiquement les informations de la ville
    const fetchCityInfo = async (cityName) => {
        if (!cityName || cityName.length < 2) return;
        
        try {
            setLoadingCityInfo(true);
            
            // D'abord, essayer de trouver la ville dans notre liste locale
            const localCity = getCityByName(cityName);
            
            if (localCity) {
                // Si la ville est trouvée localement, utiliser ces données
                setChurchForm(prev => ({
                    ...prev,
                    population: localCity.population.toString(),
                    ville: localCity.name
                }));
                
                // Ensuite, essayer de récupérer les coordonnées via l'API
                try {
                    const response = await apiService.churches.getCityInfo(localCity.name);
                    const cityInfo = response.data?.data;
                    
                    if (cityInfo && cityInfo.latitude && cityInfo.longitude) {
                        setChurchForm(prev => ({
                            ...prev,
                            latitude: cityInfo.latitude.toString(),
                            longitude: cityInfo.longitude.toString()
                        }));
                    }
                } catch (apiError) {
                    // Impossible de récupérer les coordonnées via l'API, utilisation des données locales uniquement
                }
                
                showSuccess(i18nService.t('dashboard.churches.cityInfoRetrieved', { cityName: localCity.name }));
            } else {
                // Si la ville n'est pas dans notre liste locale, essayer l'API
                const response = await apiService.churches.getCityInfo(cityName);
                const cityInfo = response.data?.data;
                
                if (cityInfo) {
                    setChurchForm(prev => ({
                        ...prev,
                        latitude: cityInfo.latitude?.toString() || '',
                        longitude: cityInfo.longitude?.toString() || '',
                        population: cityInfo.population?.toString() || '',
                        ville: cityInfo.ville || cityName
                    }));
                    showSuccess(i18nService.t('dashboard.churches.cityInfoRetrieved', { cityName: cityInfo.ville }));
                }
            }
        } catch (error) {
            // Ne pas afficher d'erreur car c'est optionnel
        } finally {
            setLoadingCityInfo(false);
        }
    };

    // Debounce pour éviter trop d'appels API
    const debouncedFetchCityInfo = React.useCallback(
        debounce(fetchCityInfo, 1000),
        []
    );

    // Fonction debounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Fonction pour rechercher des adresses via Nominatim
    const searchAddress = async (input) => {
        if (!input || input.length < 3) return [];
        setLoadingAddress(true);
        try {
            const url = 'https://nominatim.openstreetmap.org/search';
            const response = await axios.get(url, {
                params: {
                    q: input,
                    format: 'json',
                    addressdetails: 1,
                    limit: 5,
                    countrycodes: 'fr' // Limite à la France
                }
            });
            // Ajout d'un champ id unique pour chaque option
            const options = (response.data || []).map(opt => ({ ...opt, id: opt.place_id }));
            setAddressOptions(options);
        } catch (error) {
            setAddressOptions([]);
        } finally {
            setLoadingAddress(false);
        }
    };

    const handleChurchSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('nom', churchForm.nom);
            formData.append('adresse', churchForm.adresse);
            formData.append('ville', churchForm.ville);
            formData.append('latitude', churchForm.latitude ? parseFloat(churchForm.latitude) : '');
            formData.append('longitude', churchForm.longitude ? parseFloat(churchForm.longitude) : '');
            formData.append('population', churchForm.population ? parseInt(churchForm.population) : '');
            formData.append('description', churchForm.description);
            formData.append('responsable_id', churchForm.responsable || '');
            formData.append('type', churchForm.type);
            if (selectedImage) {
                formData.append('image', selectedImage);

            }
            if (editingChurchId) {
                await apiService.churches.update(editingChurchId, formData);
                showSuccess(i18nService.t('dashboard.churches.updateSuccess'));
                
                // Log de l'activité
                await logActivity(
                    ActivityActions.UPDATE,
                    EntityTypes.CHURCH,
                    editingChurchId,
                    churchForm.nom,
                    `Église modifiée: ${churchForm.nom}`
                );
            } else {
                const createdChurch = await apiService.churches.create(formData);
                showSuccess(i18nService.t('dashboard.churches.createSuccess'));
                
                // Log de l'activité
                await logActivity(
                    ActivityActions.CREATE,
                    EntityTypes.CHURCH,
                    createdChurch?.data?.id || createdChurch?.data?._id,
                    churchForm.nom,
                    `Église créée: ${churchForm.nom}`
                );
            }
            setChurchModal(false);
            setChurchForm({ nom: '', adresse: '', ville: '', latitude: '', longitude: '', population: '', description: '', responsable: '', type: 'EGLISE', image: null });
            setSelectedImage(null);
            setEditingChurchId(null);
            await loadChurches();
        } catch (err) {
            // Gérer les erreurs de manière plus intuitive
            let errorMessage = i18nService.t('dashboard.churches.operationError');
            
            if (err.response?.status === 500) {
                errorMessage = i18nService.t('dashboard.churches.serverError');
            } else if (err.response?.status === 400) {
                errorMessage = err.response?.data?.message || i18nService.t('dashboard.churches.invalidData');
            } else if (err.response?.status === 404) {
                errorMessage = i18nService.t('dashboard.churches.notFound');
            } else if (err.response?.status === 403) {
                errorMessage = i18nService.t('dashboard.churches.accessDenied');
            } else if (err.message && !err.message.includes('Request failed with status code')) {
                errorMessage = err.message;
            }
            
            showError(errorMessage);
            const processedError = handleApiError(err, 'erreur détaillée:');
            ;
        }
    };

    const handleEditChurch = (church) => {
        setChurchForm({
            nom: church.nom,
            adresse: church.adresse || '',
            ville: church.ville || '',
            latitude: church.latitude || '',
            longitude: church.longitude || '',
            population: church.population || '',
            description: church.description || '',
            responsable: church.responsable?.id || church.responsable?._id || '',
            type: church.type || 'EGLISE',
            image: null
        });
        setSelectedImage(null);
        setEditingChurchId(church.id || church._id);
        setChurchModal(true);
    };

    const handleOpenDeleteDialog = (church) => {
        setChurchToDelete(church);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setChurchToDelete(null);
    };

    const handleConfirmDeleteChurch = async () => {
        if (!churchToDelete) return;
        try {
            await apiService.churches.delete(churchToDelete.id || churchToDelete._id);
            showSuccess(i18nService.t('dashboard.churches.deleteSuccess'));
            
            // Log de l'activité
            await logActivity(
                ActivityActions.DELETE,
                EntityTypes.CHURCH,
                churchToDelete.id || churchToDelete._id,
                churchToDelete.nom,
                `Église supprimée: ${churchToDelete.nom}`
            );
            
            await loadChurches();
        } catch (err) {
            // Gérer les erreurs de suppression de manière plus intuitive
            let errorMessage = i18nService.t('dashboard.churches.deleteError');
            
            if (err.response?.status === 500) {
                errorMessage = i18nService.t('dashboard.churches.deleteServerError');
            } else if (err.response?.status === 400) {
                errorMessage = err.response?.data?.message || i18nService.t('dashboard.churches.deleteConstraintError');
            } else if (err.response?.status === 404) {
                errorMessage = i18nService.t('dashboard.churches.notFound');
            } else if (err.response?.status === 403) {
                errorMessage = i18nService.t('dashboard.churches.accessDenied');
            } else if (err.message && !err.message.includes('Request failed with status code')) {
                errorMessage = err.message;
            }
            
            showError(errorMessage);
            const processedError = handleApiError(err, 'erreur de suppression détaillée:');
            ;
        } finally {
            handleCloseDeleteDialog();
        }
    };

    // Remise à zéro du champ lors de la fermeture du modal
    useEffect(() => {
        if (!churchModal) {
            setAddressValue(null);
            setAddressInputValue('');
            setSelectedImage(null);
        }
    }, [churchModal]);

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
                    {i18nService.t('dashboard.churches.title')}
                  </Typography>
                  <Box sx={{ 
                    width: 80, 
                    height: 4, 
                    background: 'linear-gradient(90deg, #662d91, #9e005d, #9e005d)',
                    borderRadius: 2
                  }} />
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setChurchModal(true)} disabled={!canCreateChurches}>{i18nService.t('dashboard.churches.newChurch')}</Button>
            </Box>
            {loading ? (
                <Loading titre={i18nService.t('dashboard.churches.loading')} />
            ) : error ? (
                <SecureErrorMessage error={error} title={i18nService.t('dashboard.churches.loadingError')} />
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
                                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.churches.table.name')}</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.churches.table.city')}</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.churches.table.address')}</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.churches.table.members')}</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.churches.table.responsible')}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.churches.table.actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(churches) ? (
                                churches
                                    .map((church) => (
                                        <TableRow key={church.id || church._id}>
                                            <TableCell>{church.nom}</TableCell>
                                            <TableCell>{church.ville || '-'}</TableCell>
                                            <TableCell>{church.adresse || '-'}</TableCell>
                                            <TableCell>{church.nombre_membres || 0}</TableCell>
                                            <TableCell>{church.responsable ? (church.responsable.username || church.responsable.pseudo || church.responsable.email) : '-'}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    onClick={() => handleEditChurch(church)}
                                                    color="primary"
                                                    size="small"
                                                    disabled={!canUpdateChurches}
                                                    title={!canUpdateChurches ? i18nService.t('dashboard.churches.readOnlyAdmin') : ""}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleOpenDeleteDialog(church)} disabled={!canDeleteChurches} title={!canDeleteChurches ? i18nService.t('dashboard.churches.readOnlyAdmin') : ""}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))) : null}
                            {Array.isArray(churches) &&
                                churches.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">
                                            {i18nService.t('dashboard.churches.noChurches')}
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={churchModal}
                onClose={() => {
                    setChurchModal(false);
                    setEditingChurchId(null);
                    setChurchForm({ nom: '', adresse: '', ville: '', latitude: '', longitude: '', population: '', description: '', responsable: '', type: 'EGLISE', image: null });
                    setSelectedImage(null);
                }}
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
                <DialogTitle>{editingChurchId ? i18nService.t('dashboard.churches.dialog.editTitle') : i18nService.t('dashboard.churches.dialog.createTitle')}</DialogTitle>
                <form onSubmit={handleChurchSubmit}>
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: '450px' }}>
                            <TextField
                                fullWidth
                                id="church-form-nom"
                                name="nom"
                                label={i18nService.t('dashboard.churches.form.churchName')}
                                value={churchForm.nom}
                                onChange={(e) => setChurchForm({ ...churchForm, nom: e.target.value })}
                                required
                                margin="normal"
                                autoComplete="organization"
                            />
                            <Autocomplete
                                fullWidth
                                id="church-form-ville"
                                options={cityPopulations}
                                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                                value={churchForm.ville}
                                onChange={(event, newValue) => {
                                    const cityName = typeof newValue === 'string' ? newValue : newValue?.name || '';
                                    setChurchForm({ ...churchForm, ville: cityName });
                                    if (cityName) {
                                        debouncedFetchCityInfo(cityName);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        id="church-form-ville-input"
                                        name="ville"
                                        label={i18nService.t('dashboard.churches.form.city')}
                                        margin="normal"
                                        autoComplete="address-level2"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingCityInfo && (
                                                        <CircularProgress size={20} />
                                                    )}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        helperText={loadingCityInfo ? i18nService.t('dashboard.churches.form.retrievingInfo') : i18nService.t('dashboard.churches.form.cityHelper')}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        <Box>
                                            <Typography variant="body1">{option.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {i18nService.t('dashboard.churches.form.population')}: {option.population.toLocaleString()} {i18nService.t('dashboard.churches.form.inhabitants')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            />
                            <Autocomplete
                                fullWidth
                                id="church-form-adresse"
                                options={addressOptions}
                                value={addressValue}
                                inputValue={addressInputValue}
                                getOptionLabel={(option) => {
                                    if (typeof option === 'string') return option;
                                    const a = option.address || {};
                                    const parts = [
                                        a.house_number,
                                        a.road,
                                        a.postcode,
                                        a.city || a.town || a.village || ''
                                    ].filter(Boolean);
                                    return parts.join(', ');
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                filterOptions={(options) => options}
                                onInputChange={(event, newInputValue, reason) => {
                                    setAddressInputValue(newInputValue);
                                    setChurchForm({ ...churchForm, adresse: newInputValue });
                                    if (reason === 'input') {
                                        setAddressValue(null);
                                    }
                                    if (newInputValue && newInputValue.length > 2) {
                                        searchAddress(newInputValue);
                                    } else {
                                        setAddressOptions([]);
                                    }
                                }}
                                onChange={async (event, newValue) => {
                                    setAddressValue(newValue);
                                    if (!newValue) return;
                                    const address = typeof newValue === 'string' ? newValue : newValue.display_name;
                                    setAddressInputValue(address);
                                    setChurchForm(prev => ({ ...prev, adresse: address }));
                                    // Remplir automatiquement ville, lat, lon, population
                                    if (typeof newValue !== 'string') {
                                        const ville = newValue.address.city || newValue.address.town || newValue.address.village || newValue.address.municipality || newValue.address.county || '';
                                        const latitude = newValue.lat;
                                        const longitude = newValue.lon;
                                        setChurchForm(prev => ({
                                            ...prev,
                                            ville,
                                            latitude,
                                            longitude
                                        }));
                                        // Appel backend pour la population
                                        try {
                                            const response = await apiService.churches.getCityInfo(ville);
                                            const cityInfo = response.data?.data;
                                            if (cityInfo && cityInfo.population) {
                                                setChurchForm(prev => ({ ...prev, population: cityInfo.population.toString() }));
                                            }
                                        } catch (e) {}
                                    }
                                }}
                                loading={loadingAddress}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        id="church-form-adresse-input"
                                        name="adresse"
                                        label={i18nService.t('dashboard.churches.form.fullAddress')}
                                        margin="normal"
                                        autoComplete="street-address"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingAddress && <CircularProgress size={20} />}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        helperText={i18nService.t('dashboard.churches.form.addressHelper')}
                                    />
                                )}
                                renderOption={(props, option) => {
                                    const a = option.address || {};
                                    const parts = [
                                        a.house_number,
                                        a.road,
                                        a.postcode,
                                        a.city || a.town || a.village || ''
                                    ].filter(Boolean);
                                    return (
                                        <Box component="li" {...props}>
                                            <Typography variant="body1">{parts.join(', ')}</Typography>
                                        </Box>
                                    );
                                }}
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    id="church-form-population"
                                    name="population"
                                    label={i18nService.t('dashboard.churches.form.cityPopulation')}
                                    type="number"
                                    value={churchForm.population}
                                    onChange={(e) => setChurchForm({ ...churchForm, population: e.target.value })}
                                    margin="normal"
                                    autoComplete="off"
                                />
                            </Box>
                            <TextField
                                fullWidth
                                id="church-form-description"
                                name="description"
                                label={i18nService.t('dashboard.churches.form.description')}
                                multiline
                                rows={3}
                                value={churchForm.description}
                                onChange={(e) => setChurchForm({ ...churchForm, description: e.target.value })}
                                margin="normal"
                                autoComplete="off"
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="church-form-responsable-label">{i18nService.t('dashboard.churches.form.responsible')}</InputLabel>
                                <Select
                                    id="church-form-responsable"
                                    name="responsable"
                                    labelId="church-form-responsable-label"
                                    value={churchForm.responsable}
                                    label={i18nService.t('dashboard.churches.form.responsible')}
                                    onChange={(e) => setChurchForm({ ...churchForm, responsable: e.target.value })}
                                    autoComplete="off"
                                >
                                    <MenuItem value=""><em>{i18nService.t('dashboard.churches.form.none')}</em></MenuItem>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <MenuItem key={user.id || user._id} value={user.id || user._id}>
                                                {user.username || user.pseudo || user.email} - {user.eglise_locale?.nom || i18nService.t('dashboard.churches.form.noAssignedChurch')}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>
                                            {i18nService.t('dashboard.churches.form.noGovernanceUsers')}
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="church-form-type-label">{i18nService.t('dashboard.churches.form.type')}</InputLabel>
                                <Select
                                    id="church-form-type"
                                    name="type"
                                    labelId="church-form-type-label"
                                    value={churchForm.type}
                                    label={i18nService.t('dashboard.churches.form.type')}
                                    onChange={e => setChurchForm({ ...churchForm, type: e.target.value })}
                                    required
                                    autoComplete="off"
                                >
                                    <MenuItem value="EGLISE">{i18nService.t('dashboard.churches.form.typeChurch')}</MenuItem>
                                    <MenuItem value="MISSION">{i18nService.t('dashboard.churches.form.typeMission')}</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ mt: 1, mb: 2 }}
                            >
                                {selectedImage ? selectedImage.name : i18nService.t('dashboard.churches.form.chooseImage')}
                                <input
                                    id="church-image-input"
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    hidden
                                    onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                            setSelectedImage(e.target.files[0]);
                                        }
                                    }}
                                />
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setChurchModal(false);
                            setEditingChurchId(null);
                            setChurchForm({ nom: '', adresse: '', ville: '', latitude: '', longitude: '', population: '', description: '', responsable: '', type: 'EGLISE', image: null });
                            setSelectedImage(null);
                        }}>{i18nService.t('common.actions.cancel')}</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {editingChurchId ? i18nService.t('common.actions.update') : i18nService.t('common.actions.create')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            {/* Dialog de confirmation suppression */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                title={i18nService.t('dashboard.churches.deleteDialog.title')}
                content={churchToDelete ? i18nService.t('dashboard.churches.deleteDialog.content', { churchName: churchToDelete.nom }) : i18nService.t('dashboard.churches.deleteDialog.contentGeneric')}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDeleteChurch}
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

export default Churches;
