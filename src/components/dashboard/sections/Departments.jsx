import { Box, Typography, Button, TextField, TableCell, TableContainer, Table, TableHead, TableRow, Paper, TableBody, DialogActions, DialogContent, DialogTitle, IconButton, Dialog, CircularProgress } from '@mui/material';
import { handleApiError } from '@utils/errorHandler';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect } from 'react';
import SecureErrorMessage from '../../common/SecureErrorMessage';
import { useNotification } from '@hooks/useNotification';
import { apiService } from '@services/apiService';
import { usePermissions } from '@hooks/usePermissions';
import i18nService from '@services/i18nService';
import { useLanguageThemeSync } from '@hooks/useLanguageThemeSync';
import AccessControl from '../../AccessControl';
import { logActivity, ActivityActions, EntityTypes } from '@utils/activityLogger';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);
    const [departmentModal, setDepartmentModal] = useState(false);
    const [editingDepartmentId, setEditingDepartmentId] = useState(null);
    const [departmentForm, setDepartmentForm] = useState({
        nom: ''
    });
    const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');

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
        canCreateDepartments,
        canUpdateDepartments,
        canDeleteDepartments
    } = usePermissions();

    const loadDepartments = async () => {
        setLoading(true);
        try {
            const response = await apiService.departments.getAll();
            setDepartments(response.data?.data || response.data || []);
            setError(null);
        } catch (err) {
            setError(processedError.message);
            setDepartments([]);
            const processedError = handleApiError(err, 'l\'opération');
            } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const handleEditDepartment = (department) => {
        setDepartmentForm({ nom: department.nom });
        setEditingDepartmentId(department.id || department._id);
        setDepartmentModal(true);
    };

    const handleOpenDeleteDialog = (department) => {
        setDepartmentToDelete(department);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDepartmentToDelete(null);
    };

    const handleConfirmDeleteDepartment = async () => {
        if (!departmentToDelete) return;
        try {
            await apiService.departments.delete(departmentToDelete.id || departmentToDelete._id);
            showSuccess(i18nService.t('dashboard.departments.deleteSuccess'));
            
            // Log de l'activité
            await logActivity(
                ActivityActions.DELETE,
                EntityTypes.DEPARTMENT,
                departmentToDelete.id || departmentToDelete._id,
                departmentToDelete.nom,
                `Département supprimé: ${departmentToDelete.nom}`
            );
            
            await loadDepartments();
        } catch (err) {
            showError(err.message || i18nService.t('dashboard.departments.deleteError'));
        } finally {
            handleCloseDeleteDialog();
        }
    };

    const handleDepartmentSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDepartmentId) {
                await apiService.departments.update(editingDepartmentId, departmentForm);
                showSuccess(i18nService.t('dashboard.departments.updateSuccess'));
                
                // Log de l'activité
                await logActivity(
                    ActivityActions.UPDATE,
                    EntityTypes.DEPARTMENT,
                    editingDepartmentId,
                    departmentForm.nom,
                    `Département modifié: ${departmentForm.nom}`
                );
            } else {
                const createdDepartment = await apiService.departments.create(departmentForm);
                showSuccess(i18nService.t('dashboard.departments.createSuccess'));
                
                // Log de l'activité
                await logActivity(
                    ActivityActions.CREATE,
                    EntityTypes.DEPARTMENT,
                    createdDepartment?.data?.id || createdDepartment?.data?._id,
                    departmentForm.nom,
                    `Département créé: ${departmentForm.nom}`
                );
            }
            
            setDepartmentModal(false);
            setDepartmentForm({ nom: '' });
            setEditingDepartmentId(null);
            await loadDepartments();
        } catch (err) {
            showError(err.message || i18nService.t('dashboard.departments.operationError'));
            }
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
                      background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1
                    }}
                  >
                    {i18nService.t('dashboard.departments.title')}
                  </Typography>
                  <Box sx={{ 
                    width: 80, 
                    height: 4, 
                    background: 'linear-gradient(90deg, #5B21B6, #7C3AED, #8B5CF6)',
                    borderRadius: 2
                  }} />
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDepartmentModal(true)} disabled={!canCreateDepartments}>{i18nService.t('dashboard.departments.newDepartment')}</Button>
            </Box>
            <TextField
                fullWidth
                id="department-search"
                name="search"
                variant="outlined"
                placeholder={i18nService.t('dashboard.departments.searchPlaceholder')}
                value={departmentSearchTerm}
                onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 3 }}
                autoComplete="off"
            />
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <SecureErrorMessage error={error} title={i18nService.t('dashboard.departments.loadingError')} />
            ) : (
                <TableContainer 
                  data-aos="fade-up" 
                  component={Paper}
                  elevation={0}
                  sx={{
                    borderRadius: '20px',
                    border: '2px solid rgba(91, 33, 182, 0.1)',
                    boxShadow: '0 10px 40px rgba(91, 33, 182, 0.08)',
                    overflow: 'hidden'
                  }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.departments.table.name')}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.departments.table.actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(departments) ? (
                                departments
                                    .filter(department => {
                                        if (!department || !department.nom) return false;
                                        const searchTerm = (departmentSearchTerm || '').toLowerCase();
                                        const nomDepartement = String(department.nom).toLowerCase();
                                        return nomDepartement.includes(searchTerm);
                                    })
                                    .map((department) => (
                                        <TableRow key={department.id || department._id}>
                                            <TableCell>{department.nom}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    onClick={() => handleEditDepartment(department)}
                                                    color="primary"
                                                    size="small"
                                                    disabled={!canUpdateDepartments}
                                                    title={!canUpdateDepartments ? i18nService.t('dashboard.departments.readOnlyAdmin') : ""}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleOpenDeleteDialog(department)} disabled={!canDeleteDepartments} title={!canDeleteDepartments ? i18nService.t('dashboard.departments.readOnlyAdmin') : ""}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            ) : null}
                            {Array.isArray(departments) &&
                                departments.filter(department => department.nom.toLowerCase().includes(departmentSearchTerm.toLowerCase())).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">
                                            {departments.length === 0 ? i18nService.t('dashboard.departments.noDepartments') : i18nService.t('dashboard.departments.noSearchResults')}
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <Dialog
                open={departmentModal}
                onClose={() => {
                    setDepartmentModal(false);
                    setEditingDepartmentId(null);
                    setDepartmentForm({ nom: '' });
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
                <DialogTitle>{editingDepartmentId ? i18nService.t('dashboard.departments.dialog.editTitle') : i18nService.t('dashboard.departments.dialog.createTitle')}</DialogTitle>
                <form onSubmit={handleDepartmentSubmit}>
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: '450px' }}>
                            <TextField
                                fullWidth
                                id="department-form-nom"
                                name="nom"
                                label={i18nService.t('dashboard.departments.form.departmentName')}
                                value={departmentForm.nom}
                                onChange={(e) => setDepartmentForm({ ...departmentForm, nom: e.target.value })}
                                margin="normal"
                                required
                                autoComplete="off"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setDepartmentModal(false);
                            setEditingDepartmentId(null);
                            setDepartmentForm({ nom: '' });
                        }}>{i18nService.t('common.actions.cancel')}</Button>
                        <Button type="submit" variant="contained" color="primary">{editingDepartmentId ? i18nService.t('common.actions.update') : i18nService.t('common.actions.create')}</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                title={i18nService.t('dashboard.departments.deleteDialog.title')}
                content={departmentToDelete ? i18nService.t('dashboard.departments.deleteDialog.content', { departmentName: departmentToDelete.nom }) : i18nService.t('dashboard.departments.deleteDialog.contentGeneric')}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDeleteDepartment}
            />
            </Box>
        </AccessControl>
    );
};

export default Departments;
