import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { usePermissions } from '@hooks/usePermissions';
import { useNotification } from '@hooks/useNotification';
import { apiService } from '@services/apiService';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import Loading from '../../Loading';
import SecureErrorMessage from '../../common/SecureErrorMessage';
import i18nService from '@services/i18nService';
import { useLanguageThemeSync } from '@hooks/useLanguageThemeSync';
import { logActivity, ActivityActions, EntityTypes } from '@utils/activityLogger';

const Groups = ({ selectedChurch }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [groupModal, setGroupModal] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [groupForm, setGroupForm] = useState({
        nom: '',
        responsable1: '',
        responsable2: ''
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [members, setMembers] = useState([]);

    // Initialiser le service i18n et forcer le re-rendu sur changement de langue
    useEffect(() => {
        i18nService.init();
    }, []);
    const lastUpdate = useLanguageThemeSync();

    const {
        canCreateGroups,
        canUpdateGroups,
        canDeleteGroups
    } = usePermissions();

    const {
        notification,
        showSuccess,
        showError,
        hideNotification
    } = useNotification();

    const loadGroups = async () => {
        setLoading(true);
        try {
            const response = await apiService.groups.getAll();
            setGroups(response.data?.data || response.data || []);
            setError(null);
        } catch (err) {
            setError(err.message || i18nService.t('dashboard.groups.loadingError'));
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

    const loadMembers = async () => {
        try {
            const response = await apiService.users.getAll();
            setMembers(response.data?.data || response.data || []);
        } catch (err) {
            setMembers([]);
        }
    };

    useEffect(() => {
        loadGroups();
        loadMembers();
    }, []);

    const handleGroupSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingGroupId) {
                await apiService.groups.update(editingGroupId, groupForm);
                showSuccess(i18nService.t('dashboard.groups.updateSuccess'));
                
                // Log de l'activité
                await logActivity(
                    ActivityActions.UPDATE,
                    EntityTypes.GROUP,
                    editingGroupId,
                    groupForm.nom,
                    `Groupe modifié: ${groupForm.nom}`
                );
            } else {
                const createdGroup = await apiService.groups.create(groupForm);
                showSuccess(i18nService.t('dashboard.groups.createSuccess'));
                
                // Log de l'activité
                await logActivity(
                    ActivityActions.CREATE,
                    EntityTypes.GROUP,
                    createdGroup?.data?.id || createdGroup?.data?._id,
                    groupForm.nom,
                    `Groupe créé: ${groupForm.nom}`
                );
            }
            setGroupModal(false);
            setGroupForm({ nom: '', responsable1: '', responsable2: '' });
            setEditingGroupId(null);
            await loadGroups();
        } catch (err) {
            showError(err.message || i18nService.t('dashboard.groups.operationError'));
        }
    };

    const handleEditGroup = (group) => {
        setGroupForm({
            nom: group.nom,
            responsable1: group.responsable1?.id || group.responsable1?._id || '',
            responsable2: group.responsable2?.id || group.responsable2?._id || ''
        });
        setEditingGroupId(group.id || group._id);
        setGroupModal(true);
    };

    const handleOpenDeleteDialog = (group) => {
        setGroupToDelete(group);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setGroupToDelete(null);
    };

    const handleConfirmDeleteGroup = async () => {
        if (!groupToDelete) return;
        try {
            await apiService.groups.delete(groupToDelete.id || groupToDelete._id);
            showSuccess(i18nService.t('dashboard.groups.deleteSuccess'));
            
            // Log de l'activité
            await logActivity(
                ActivityActions.DELETE,
                EntityTypes.GROUP,
                groupToDelete.id || groupToDelete._id,
                groupToDelete.nom,
                `Groupe supprimé: ${groupToDelete.nom}`
            );
            
            await loadGroups();
        } catch (err) {
            showError(err.message || i18nService.t('dashboard.groups.deleteError'));
        } finally {
            handleCloseDeleteDialog();
        }
    };

    // Protection : ne pas afficher les données si selectedChurch n'est pas valide
    if (!selectedChurch) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <Typography variant="h6" color="text.secondary">
                    {i18nService.t('dashboard.groups.selectChurchMessage')}
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Bouton d'ajout de groupe - désactivé pour les admins */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    {i18nService.t('dashboard.groups.title')}
                  </Typography>
                  <Box sx={{ 
                    width: 80, 
                    height: 4, 
                    background: 'linear-gradient(90deg, #662d91, #9e005d, #9e005d)',
                    borderRadius: 2
                  }} />
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setGroupModal(true)}
                    disabled={!canCreateGroups}
                    title={!canCreateGroups ? i18nService.t('dashboard.groups.readOnlyAdmin') : ""}
                >
                    {i18nService.t('dashboard.groups.addGroup')}
                </Button>
            </Box>

            {loading ? (
                <Loading titre={i18nService.t('dashboard.groups.loading')} />
            ) : error ? (
                <SecureErrorMessage error={error} title={i18nService.t('dashboard.groups.loadingError')} />
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
                                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.groups.table.name')}</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.groups.table.responsible1')}</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.groups.table.responsible2')}</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.groups.table.members')}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.groups.table.actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(groups) && groups.map((group) => (
                                <TableRow key={group.id || group._id}>
                                    <TableCell>{group.nom}</TableCell>
                                    <TableCell>{group.responsable1?.username || group.responsable1?.pseudo || '-'}</TableCell>
                                    <TableCell>{group.responsable2?.username || group.responsable2?.pseudo || '-'}</TableCell>
                                    <TableCell>{group.memberCount || 0}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={() => handleEditGroup(group)}
                                            disabled={!canUpdateGroups}
                                            title={!canUpdateGroups ? i18nService.t('dashboard.groups.readOnlyAdmin') : ""}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleOpenDeleteDialog(group)}
                                            disabled={!canDeleteGroups}
                                            title={!canDeleteGroups ? i18nService.t('dashboard.groups.readOnlyAdmin') : ""}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {Array.isArray(groups) && groups.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        {i18nService.t('dashboard.groups.noGroups')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialog pour créer/modifier un groupe */}
            <Dialog
                open={groupModal}
                onClose={() => setGroupModal(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingGroupId ? i18nService.t('dashboard.groups.dialog.editTitle') : i18nService.t('dashboard.groups.dialog.createTitle')}
                </DialogTitle>
                <form onSubmit={handleGroupSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            id="group-form-nom"
                            name="nom"
                            label={i18nService.t('dashboard.groups.form.name')}
                            value={groupForm.nom}
                            onChange={(e) => setGroupForm({ ...groupForm, nom: e.target.value })}
                            margin="normal"
                            required
                            autoComplete="off"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="group-form-responsable1-label">{i18nService.t('dashboard.groups.form.responsible1')}</InputLabel>
                            <Select
                                id="group-form-responsable1"
                                name="responsable1"
                                value={groupForm.responsable1}
                                onChange={(e) => setGroupForm({ ...groupForm, responsable1: e.target.value })}
                                labelId="group-form-responsable1-label"
                                autoComplete="off"
                                required
                            >
                                <MenuItem value="">{i18nService.t('dashboard.groups.form.selectResponsible')}</MenuItem>
                                {members.map((member) => (
                                    <MenuItem key={member.id || member._id} value={member.id || member._id}>
                                        {member.username || member.pseudo || member.email}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="group-form-responsable2-label">{i18nService.t('dashboard.groups.form.responsible2')}</InputLabel>
                            <Select
                                id="group-form-responsable2"
                                name="responsable2"
                                value={groupForm.responsable2}
                                onChange={(e) => setGroupForm({ ...groupForm, responsable2: e.target.value })}
                                labelId="group-form-responsable2-label"
                                autoComplete="off"
                            >
                                <MenuItem value="">{i18nService.t('dashboard.groups.form.selectResponsible')}</MenuItem>
                                {members.map((member) => (
                                    <MenuItem key={member.id || member._id} value={member.id || member._id}>
                                        {member.username || member.pseudo || member.email}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setGroupModal(false)}>{i18nService.t('common.actions.cancel')}</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {editingGroupId ? i18nService.t('common.actions.update') : i18nService.t('common.actions.create')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Dialog de confirmation suppression */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                title={i18nService.t('dashboard.groups.deleteDialog.title')}
                content={groupToDelete ? i18nService.t('dashboard.groups.deleteDialog.content', { groupName: groupToDelete.nom }) : i18nService.t('dashboard.groups.deleteDialog.contentGeneric')}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDeleteGroup}
            />
        </Box>
    );
};

export default Groups;

