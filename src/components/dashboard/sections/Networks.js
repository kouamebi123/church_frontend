import React, { useState, useEffect, useCallback } from 'react';
import { handleApiError } from '../../../utils/errorHandler';
import { Typography, Box, IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Collapse, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Snackbar, Alert } from '@mui/material';
import i18nService from '../../../services/i18nService';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import Loading from './../../Loading';
import SecureErrorMessage from '../../common/SecureErrorMessage';
import { useNetworks } from '../../../hooks/useApi';
import { useNotification } from '../../../hooks/useNotification';
import { apiService } from '../../../services/apiService';
import { usePermissions } from '../../../hooks/usePermissions';
import { formatQualificationWithFallback } from '../../../utils/qualificationFormatter';
import { logActivity, ActivityActions, EntityTypes } from '../../../utils/activityLogger';

const Networks = ({ selectedChurch, user }) => {
    
    const {
        networks,
        loading,
        error,
        fetchNetworks,
        createNetwork,
        updateNetwork,
        deleteNetwork
    } = useNetworks(selectedChurch ? { churchId: selectedChurch.id } : {});


    // Fonction de rafraîchissement manuel
    const handleRefresh = useCallback(async () => {
        if (selectedChurch?.id) {
            await fetchNetworks({ churchId: selectedChurch.id });
        }
    }, [fetchNetworks, selectedChurch?.id]);

    // Rafraîchir automatiquement quand l'église change
    useEffect(() => {
        if (selectedChurch?.id) {
            handleRefresh();
        }
    }, [selectedChurch?.id, handleRefresh]);

    const {
        notification,
        showSuccess,
        showError,
        hideNotification
    } = useNotification();

    const {
        canCreateNetworks,
        canUpdateNetworks,
        canDeleteNetworks
    } = usePermissions();

    const [expandedNetworkId, setExpandedNetworkId] = useState(null);
    const [expandedGrId, setExpandedGrId] = useState(null);
    const [networkDetails, setNetworkDetails] = useState({});
    const [networkGrs, setNetworkGrs] = useState({});
    const [groupDetails, setGroupDetails] = useState({});
    const [networkModal, setNetworkModal] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [networkToDelete, setNetworkToDelete] = useState(null);
    const [networkForm, setNetworkForm] = useState({
        nom: '',
        responsable1: '',
        responsable2: null
    });
    const [editingNetworkId, setEditingNetworkId] = useState(null);
    const [networkSearchTerm, setNetworkSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [membersError, setMembersError] = useState(null);
    const [churches, setChurches] = useState([]);
    const [formError, setFormError] = useState('');

    // Fonction pour charger les membres disponibles (isolés) + responsable actuel
    const loadMembers = useCallback(async () => {
        try {
            // Charger les utilisateurs disponibles (isolés) de l'église sélectionnée
            const availableResponse = await apiService.users.getAvailable({ 
                churchId: selectedChurch?.id 
            });
            const availableUsers = availableResponse.data?.data || availableResponse.data || [];
            
            // Si on est en mode édition, ajouter le responsable actuel du réseau
            if (editingNetworkId && networkForm.responsable1) {
                try {
                    const currentResponsableResponse = await apiService.users.getById(networkForm.responsable1);
                    const currentResponsable = currentResponsableResponse.data?.data || currentResponsableResponse.data;
                    
                    if (currentResponsable) {
                        // Vérifier si le responsable actuel n'est pas déjà dans la liste
                        const isAlreadyInList = availableUsers.some(user => 
                            (user.id || user._id) === (currentResponsable.id || currentResponsable._id)
                        );
                        
                        if (!isAlreadyInList) {
                            availableUsers.push(currentResponsable);
                        }
                    }
                } catch (err) {
                    // Erreur silencieuse lors du chargement du responsable actuel
                }
            }
            
            setMembers(availableUsers);
        } catch (err) {
            const processedError = handleApiError(err, 'le chargement des membres disponibles');
            setMembersError(processedError.message);
        }
    }, [selectedChurch?.id, editingNetworkId, networkForm.responsable1]);

    const loadChurches = useCallback(async () => {
        try {
            const response = await apiService.churches.getAll();
            setChurches(response.data?.data || response.data || []);
        } catch (err) {
            setChurches([]);
        }
    }, []);

    const handleNetworkClick = async (networkId) => {
        setExpandedNetworkId(expandedNetworkId === networkId ? null : networkId);
        setExpandedGrId(null);
        if (!networkDetails[networkId]) {
            try {
                const res = await apiService.networks.getById(networkId);
                setNetworkDetails(prev => ({ ...prev, [networkId]: res.data?.data || res.data }));
            } catch (e) { /* gestion erreur possible */ }
        }
        if (!networkGrs[networkId]) {
            try {
                const res = await apiService.networks.getGroups(networkId);
                setNetworkGrs(prev => ({ ...prev, [networkId]: res.data?.data || res.data }));
            } catch (e) { /* gestion erreur possible */ }
        }
    };

    const handleGrClick = async (grId) => {
        setExpandedGrId(expandedGrId === grId ? null : grId);
        if (!groupDetails[grId]) {
            try {
                const res = await apiService.groups.getById(grId);
                const groupData = res.data?.data || res.data;
                setGroupDetails(prev => ({ ...prev, [grId]: groupData }));
            } catch (e) { 
                const processedError = handleApiError(e, 'le chargement du groupe');
                // Erreur silencieuse lors du chargement du groupe
            }
        }
    };

    useEffect(() => {
        fetchNetworks();
        loadMembers();
        loadChurches();
    }, [selectedChurch, fetchNetworks, loadMembers, loadChurches]); // Utiliser selectedChurch au lieu de fetchNetworks

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

    // Fonctions de gestion des formulaires
    const handleSubmitNetwork = async (e) => {
        e.preventDefault();
        
        if (!networkForm.nom || !networkForm.responsable1) {
            setFormError('Le nom et le responsable principal sont requis');
            return;
        }
        
        try {
            const formData = {
                nom: networkForm.nom,
                responsable1: networkForm.responsable1,
                ...(networkForm.responsable2 && { responsable2: networkForm.responsable2 }),
                church: selectedChurch.id
            };

            if (editingNetworkId) {
                await updateNetwork(editingNetworkId, formData);
                showSuccess('Réseau modifié avec succès');
                
                // Log de l'activité
                await logActivity(
                    ActivityActions.UPDATE,
                    EntityTypes.NETWORK,
                    editingNetworkId,
                    formData.nom,
                    `Réseau modifié: ${formData.nom}`
                );
            } else {
                const createdNetwork = await createNetwork(formData);
                showSuccess('Réseau créé avec succès');
                
                // Log de l'activité
                await logActivity(
                    ActivityActions.CREATE,
                    EntityTypes.NETWORK,
                    createdNetwork?.id || createdNetwork?._id,
                    formData.nom,
                    `Réseau créé: ${formData.nom}`
                );
            }

            setNetworkModal(false);
            setNetworkForm({ nom: '', responsable1: '', responsable2: null });
            setEditingNetworkId(null);
            setFormError(''); // Réinitialiser l'erreur
            
            // Forcer un rafraîchissement immédiat
            setTimeout(() => {
                handleRefresh();
            }, 100);
        } catch (err) {
            // Afficher l'erreur dans le formulaire
            const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'opération';
            setFormError(errorMessage);
            
            // Aussi afficher dans la notification globale
            showError(errorMessage);
        }
    };

    const handleEditNetwork = (network) => {
        setNetworkForm({
            nom: network.nom,
            responsable1: network.responsable1?.id || network.responsable1?._id || network.responsable1 || '',
            responsable2: network.responsable2?.id || network.responsable2?._id || network.responsable2 || null
        });
        setEditingNetworkId(network.id || network._id);
        setNetworkModal(true);
        
        // Recharger les membres pour inclure le responsable actuel
        setTimeout(() => {
            loadMembers();
        }, 100);
    };

    // Ouvre le dialog de confirmation
    const handleOpenDeleteDialog = (network) => {
        setNetworkToDelete(network);
        setDeleteDialogOpen(true);
    };

    // Ferme le dialog
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setNetworkToDelete(null);
    };

    // Confirme la suppression
    const handleConfirmDeleteNetwork = async () => {
        if (!networkToDelete) return;
        try {
            await deleteNetwork(networkToDelete.id || networkToDelete._id);
            showSuccess('Réseau supprimé avec succès');
            
            // Log de l'activité
            await logActivity(
                ActivityActions.DELETE,
                EntityTypes.NETWORK,
                networkToDelete.id || networkToDelete._id,
                networkToDelete.nom,
                `Réseau supprimé: ${networkToDelete.nom}`
            );
            
            // Forcer un rafraîchissement immédiat
            setTimeout(() => {
                handleRefresh();
            }, 100);
        } catch (err) {
            // Afficher uniquement la notification d'erreur en bas
            showError(err.response?.data?.message || err.message || 'Erreur lors de la suppression');
        } finally {
            handleCloseDeleteDialog();
        }
    };

    return (
        <Box sx={{ 
          width: '100%',
          overflow: 'hidden', // Empêcher le scroll vertical
          overflowX: 'auto' // Permettre le scroll horizontal uniquement si nécessaire
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>{i18nService.t('dashboard.networks.management')}</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <IconButton onClick={handleRefresh} disabled={loading} aria-label={i18nService.t('common.actions.refresh')}>
                        <RefreshIcon />
                    </IconButton>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
                        setNetworkModal(true);
                        setFormError(''); // Réinitialiser l'erreur
                    }} disabled={!canCreateNetworks || !selectedChurch?.id}>{i18nService.t('dashboard.networks.newNetwork')}</Button>
                </Box>
            </Box>
            <TextField data-aos="fade-up"
                fullWidth
                variant="outlined"
                placeholder={i18nService.t('dashboard.networks.searchPlaceholder')}
                value={networkSearchTerm}
                onChange={(e) => setNetworkSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 3 }}
            />
            {loading ? (
                <Loading titre={i18nService.t('dashboard.networks.loading')} />
            ) : error ? (
                <SecureErrorMessage error={error} title={i18nService.t('dashboard.networks.loadingError')} />
            ) : (
                <TableContainer data-aos="fade-up" component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nom</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Responsable(s)</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Église</TableCell>
                                                                    <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>{i18nService.t('dashboard.networks.table.actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(networks) ? (
                                networks
                                    .filter(network => network.nom.toLowerCase().includes(networkSearchTerm.toLowerCase()))
                                    .map((network) => (
                                        <React.Fragment key={network.id || network._id}>
                                            <TableRow hover onClick={() => handleNetworkClick(network.id || network._id)} style={{ cursor: 'pointer' }}>
                                                <TableCell>
                                                    <IconButton size="small">
                                                        {expandedNetworkId === (network.id || network._id) ? <ExpandLess /> : <ExpandMore />}
                                                    </IconButton>
                                                    {network.nom}
                                                </TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        const getLabel = (user) => user?.username || user?.pseudo || user?.email || '-';
                                                        const r1 = typeof network.responsable1 === 'object'
                                                            ? getLabel(network.responsable1)
                                                            : getLabel(members.find(m => (m.id || m._id) === network.responsable1));
                                                        const r2 = typeof network.responsable2 === 'object'
                                                            ? getLabel(network.responsable2)
                                                            : getLabel(members.find(m => (m.id || m._id) === network.responsable2));
                                                        if (r1 && r2 && r2 !== '-') return `${r1} & ${r2}`;
                                                        if (r1 && r1 !== '-') return r1;
                                                        if (r2 && r2 !== '-') return r2;
                                                        return '-';
                                                    })()}
                                                </TableCell>
                                                <TableCell>
                                                    {network.church ? (churches.find(c => (c.id || c._id) === (network.church?.id || network.church?._id || network.church))?.nom || '-') : '-'}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        onClick={e => { e.stopPropagation(); handleEditNetwork(network); }}
                                                        color="primary"
                                                        size="small"
                                                        disabled={!canUpdateNetworks}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={e => { e.stopPropagation(); handleOpenDeleteDialog(network); }}
                                                        color="error"
                                                        size="small"
                                                        disabled={!canDeleteNetworks}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                    {/* Action: Détail réseau */}
                                                    <IconButton
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            window.open(`/networks/${network.id || network._id}`, '_blank');
                                                        }}
                                                        color="info"
                                                        size="small"
                                                        title={i18nService.t('common.actions.view')}
                                                    >
                                                        <GroupIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                                    <Collapse in={expandedNetworkId === (network.id || network._id)} timeout="auto" unmountOnExit>
                                                        <Box margin={1}>

                                                            <Table size="small">
                                                                <TableBody>
                                                                    {Array.isArray(networkGrs[network.id || network._id]) && networkGrs[network.id || network._id].map((gr) => (
                                                                        <React.Fragment key={gr.id || gr._id}>
                                                                            <TableRow hover onClick={e => { e.stopPropagation(); handleGrClick(gr.id || gr._id); }} style={{ cursor: 'pointer' }}>
                                                                                <TableCell>
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                        <GroupIcon color="primary" />
                                                                                        {expandedGrId === (gr.id || gr._id) ? <ExpandLess /> : <ExpandMore />}
                                                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                                            {gr.responsable2?.username
                                                                                                ? `GR ${gr.responsable1?.username} & ${gr.responsable2?.username}`
                                                                                                : `GR ${gr.responsable1?.username}`}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                            <TableRow>
                                                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                                                                    <Collapse in={expandedGrId === (gr.id || gr._id)} timeout="auto" unmountOnExit>
                                                                                        <Box margin={1}>

                                                                                                                        <ol style={{ paddingLeft: '2rem' }}>
                                {(groupDetails[gr.id || gr._id]?.members || []).map(member => {
                                    // Gérer la structure imbriquée des membres
                                    const memberData = member.user || member;
                                    const memberId = member.id || member._id || memberData.id || memberData._id;
                                    const username = memberData.username || memberData.pseudo || 'Nom inconnu';
                                    const qualification = formatQualificationWithFallback(memberData.qualification, 'Non définie');
                                    
                                    return (
                                        <li
                                            key={memberId}
                                            style={{
                                                background: '#f5f5f5',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                marginBottom: '8px',
                                                color: '#333',
                                                display: 'flex',
                                                alignItems: 'center',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                                transition: 'background 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = '#e3f2fd'}
                                            onMouseOut={e => e.currentTarget.style.background = '#f5f5f5'}
                                        >
                                            <span style={{ marginRight: '10px', color: '#1976d2' }}>👤</span>
                                            <span style={{ fontWeight: 500 }}>{username}</span>
                                            <span style={{ marginLeft: '8px', fontStyle: 'italic', color: '#4b5563' }}>
                                                ({qualification})
                                            </span>
                                        </li>
                                    );
                                })}
                            </ol>
                                                                                        </Box>
                                                                                    </Collapse>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        </React.Fragment>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))
                            ) : null}
                            {Array.isArray(networks) &&
                                networks.filter(network => network.nom.toLowerCase().includes(networkSearchTerm.toLowerCase())).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            {networks.length === 0 ? i18nService.t('dashboard.networks.noNetworks') : i18nService.t('dashboard.networks.noSearchResults')}
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={networkModal}
                onClose={() => setNetworkModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        width: '100%',
                        maxWidth: '450px',
                        margin: '20px'
                    }
                }}
            >

                <DialogTitle>{editingNetworkId ? i18nService.t('dashboard.networks.dialog.editTitle') : i18nService.t('dashboard.networks.dialog.createTitle')}</DialogTitle>
                
                {/* Affichage de l'erreur du formulaire */}
                {formError && (
                    <Box sx={{ px: 3, pb: 2 }}>
                        <Alert severity="error" onClose={() => setFormError('')}>
                            {formError}
                        </Alert>
                    </Box>
                )}
                
                <form onSubmit={handleSubmitNetwork}>
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <Grid container spacing={2} sx={{ display: 'flex', }}>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        id="network-form-nom"
                                        name="nom"
                                        sx={{ width: 400 }}
                                        label={i18nService.t('dashboard.networks.form.networkName')}
                                        value={networkForm.nom}
                                        onChange={(e) => setNetworkForm({ ...networkForm, nom: e.target.value })}
                                        margin="normal"
                                        required
                                        autoComplete="off"
                                    />
                                </Grid>

                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 400 }} margin="normal">
                                        <InputLabel id="network-form-responsable1-label">{i18nService.t('networks.details.responsable1')}</InputLabel>
                                        <Select
                                            id="network-form-responsable1"
                                            name="responsable1"
                                            labelId="network-form-responsable1-label"
                                            value={networkForm.responsable1}
                                            label={i18nService.t('networks.details.responsable1')}
                                            onChange={(e) => setNetworkForm({ ...networkForm, responsable1: e.target.value })}
                                            required
                                            autoComplete="off"
                                        >
                                            <MenuItem value=""><em>Aucun</em></MenuItem>
                                            {members.map((member) => (
                                                <MenuItem key={member.id || member._id} value={member.id || member._id}>{member.username || member.pseudo || member.email}</MenuItem>
                                            ))}
                                        </Select>
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                                            {i18nService.t('networks.details.responsable1Helper')}
                                        </Typography>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 400 }} margin="normal">
                                        <InputLabel id="network-form-responsable2-label" sx={{ color: '#757575' }}>{i18nService.t('networks.details.responsable2')}</InputLabel>
                                        <Select
                                            id="network-form-responsable2"
                                            name="responsable2"
                                            labelId="network-form-responsable2-label"
                                            value={networkForm.responsable2 || ''}
                                            label={i18nService.t('networks.details.responsable2')}
                                            onChange={(e) => setNetworkForm({ ...networkForm, responsable2: e.target.value })}
                                            disabled={true}
                                            autoComplete="off"
                                            sx={{
                                                backgroundColor: '#e0e0e0',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#bdbdbd'
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#bdbdbd'
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#bdbdbd'
                                                },
                                                '& .MuiSelect-icon': {
                                                    color: '#9e9e9e'
                                                }
                                            }}
                                        >
                                            <MenuItem value=""><em>Aucun</em></MenuItem>
                                            {members.map((member) => (
                                                <MenuItem key={member.id || member._id} value={member.id || member._id}>{member.username || member.pseudo || member.email}</MenuItem>
                                            ))}
                                        </Select>
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                                            {i18nService.t('networks.details.responsable2Helper')}
                                        </Typography>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setNetworkModal(false)}>{i18nService.t('dashboard.members.roleDialog.cancel')}</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={!canCreateNetworks}>{editingNetworkId ? i18nService.t('dashboard.networks.dialog.editTitle') : i18nService.t('dashboard.networks.dialog.createTitle')}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Dialog de confirmation suppression */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                title={i18nService.t('dashboard.networks.deleteDialog.title')}
                content={networkToDelete ? i18nService.t('dashboard.networks.deleteDialog.content', { networkName: networkToDelete.nom }) : i18nService.t('dashboard.networks.deleteDialog.contentGeneric')}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDeleteNetwork}
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
    );
};

export default Networks;
