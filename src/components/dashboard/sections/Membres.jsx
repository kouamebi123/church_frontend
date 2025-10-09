import { Box, Typography, Button, TextField, TableCell, TableContainer, Table, TableHead, TableRow, Paper, TableBody, DialogActions, DialogContent, DialogTitle, IconButton, Dialog, Tooltip, Grid, FormControl, InputLabel, MenuItem, Select, Snackbar, Alert } from '@mui/material';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import { useState, useEffect, useCallback } from 'react';
import { ROLE_OPTIONS, QUALIFICATION_OPTIONS, GENRE_OPTIONS, TRANCHE_AGE_OPTIONS, SITUATION_MATRIMONIALE_OPTIONS, NIVEAU_EDUCATION_OPTIONS } from '@constants/enums';
import { formatQualification } from '@utils/qualificationFormatter';
import { COUNTRIES } from '@constants/countries';
import Loading from '../../Loading';
import SecureErrorMessage from '../../common/SecureErrorMessage';
import { useUsers } from '@hooks/useApi';
import { handleApiError } from '@utils/errorHandler';
import { useNotification } from '@hooks/useNotification';
import { useAuth } from '@hooks/useAuth';
import { apiService } from '@services/apiService';
import { usePermissions } from '@hooks/usePermissions';
import { formatQualificationWithFallback } from '@utils/qualificationFormatter';
import { formatRoleWithFallback } from '@utils/roleFormatter';
import i18nService from '@services/i18nService';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../../config/apiConfig';
import roleService from '@services/roleService';
import { logActivity, ActivityActions, EntityTypes } from '@utils/activityLogger';
import logger from '@utils/logger';


const Membres = ({ selectedChurch }) => {
    // --- Ajout de l'état pour les groupes ---
    const [groups, setGroups] = useState([]);
    const [groupsError, setGroupsError] = useState(null);
    const [churches, setChurches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [departmentsError, setDepartmentsError] = useState(null);
    const [churchesError, setChurchesError] = useState(null);

    const { user } = useAuth();
    const permissions = usePermissions();

    const {
        users: members,
        loading,
        error,
        fetchUsers: loadMembers,
        createUser,
        updateUser,
        deleteUser
    } = useUsers(selectedChurch ? { churchId: selectedChurch.id } : {});

    const {
        notification,
        showSuccess,
        showError,
        hideNotification
    } = useNotification();

    const {
        canCreateUsers,
        canUpdateUsers,
        canDeleteUsers,
        canAssignAdminRole,
        canAssignManagerRole,
        canAssignSuperAdminRole,
        canModifyChurchField
    } = usePermissions();

    // Dialogs pour actions membres
    const [roleDialog, setRoleDialog] = useState({ open: false, member: null, roles: [] });
    const [resetDialog, setResetDialog] = useState({ open: false, member: null, newPassword: '' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, member: null });
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [isolatedMembers, setIsolatedMembers] = useState([]);
    const [memberModal, setMemberModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState(null);

    const [memberForm, setMemberForm] = useState({
        username: '',
        pseudo: '',
        role: i18nService.t('dashboard.members.form.defaults.role'),
        genre: i18nService.t('dashboard.members.form.defaults.gender'),
        tranche_age: i18nService.t('dashboard.members.form.defaults.ageRange'),
        profession: i18nService.t('dashboard.members.form.defaults.profession'),
        ville_residence: i18nService.t('dashboard.members.form.defaults.city'),
        origine: i18nService.t('dashboard.members.form.defaults.origin'),
        situation_matrimoniale: i18nService.t('dashboard.members.form.defaults.maritalStatus'),
        niveau_education: i18nService.t('dashboard.members.form.defaults.education'),
        eglise_locale_id: canModifyChurchField ? '' : (permissions.isManager ? (user?.eglise_locale?.id || user?.eglise_locale || '') : ''),
        sert_departement: i18nService.t('dashboard.members.form.no'),
        departement_id: '',
        departement_ids: [], // Nouveau champ pour les départements multiples
        qualification: i18nService.t('dashboard.members.form.defaults.qualification'),
        email: '',
        telephone: '',
        adresse: '',
        image: ''
    });

    // États pour l'upload d'image
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Fonction pour réinitialiser le formulaire
    const resetForm = useCallback(() => {
        setMemberForm({
            username: '',
            pseudo: '',
            role: i18nService.t('dashboard.members.form.defaults.role'),
            genre: i18nService.t('dashboard.members.form.defaults.gender'),
            tranche_age: i18nService.t('dashboard.members.form.defaults.ageRange'),
            profession: i18nService.t('dashboard.members.form.defaults.profession'),
            ville_residence: i18nService.t('dashboard.members.form.defaults.city'),
            origine: '',
            situation_matrimoniale: i18nService.t('dashboard.members.form.defaults.maritalStatus'),
            niveau_education: i18nService.t('dashboard.members.form.defaults.education'),
            eglise_locale_id: canModifyChurchField ? '' : (permissions.isManager ? (user?.eglise_locale?.id || user?.eglise_locale || '') : ''),
            sert_departement: i18nService.t('dashboard.members.form.no'),
            departement_id: '',
            departement_ids: [],
            qualification: i18nService.t('dashboard.members.form.defaults.qualification'),
            email: '',
            telephone: '',
            adresse: '',
            image: ''
        });
        setSelectedImage(null);
        setImagePreview(null);
    }, [user, canModifyChurchField]);

    // Fonctions pour l'upload d'image
    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                toast.error('Veuillez sélectionner un fichier image valide');
                return;
            }
            
            // Vérifier la taille (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('L\'image ne doit pas dépasser 5MB');
                return;
            }

            setSelectedImage(file);
            
            // Créer une prévisualisation
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
        
        // Réinitialiser la valeur de l'input pour permettre la sélection du même fichier
        event.target.value = '';
    };


    const handleRemoveImage = () => {
        setMemberForm({ ...memberForm, image: '' });
        setSelectedImage(null);
        setImagePreview(null);
    };

    const loadChurches = useCallback(async () => {
        try {
            const response = await apiService.churches.getAll();
            setChurches(response.data?.data || response.data || []);
            setChurchesError(null);
        } catch (err) {
            const processedError = handleApiError(err, i18nService.t('dashboard.members.errors.loadingChurches'));
            setChurches([]);
            setChurchesError(processedError.message);
        }
    }, []);

    // Fonction pour charger les départements
    const loadDepartments = useCallback(async () => {
        setLoadingDepartments(true);
        try {
            const response = await apiService.departments.getAll();
            setDepartments(response.data?.data || response.data || []);
            setDepartmentsError(null);
        } catch (err) {
            const processedError = handleApiError(err, i18nService.t('dashboard.members.errors.loadingDepartments'));
            setDepartmentsError(processedError.message);
            setDepartments([]);
        } finally {
            setLoadingDepartments(false);
        }
    }, []);

    const loadIsolatedMembers = useCallback(async () => {
        try {
            if (!selectedChurch?.id) return;
            
            const response = await apiService.users.getIsoles({ churchId: selectedChurch.id });
            setIsolatedMembers(response.data?.data || response.data || []);
        } catch (err) {
            const processedError = handleApiError(err, i18nService.t('dashboard.members.errors.loadingIsolatedMembers'));
            }
    }, [selectedChurch?.id]);

    // Fonction pour charger les groupes
    const loadGroups = useCallback(async () => {
        try {
            const response = await apiService.groups.getAll();
            const groupsData = response.data?.data || response.data || [];
            setGroups(groupsData);
            setGroupsError(null);
        } catch (err) {
            const processedError = handleApiError(err, i18nService.t('dashboard.members.errors.loadingGroups'));
            setGroupsError(processedError.message);
            setGroups([]);
        }
    }, []);

    // Charger les données au montage du composant
    useEffect(() => {
        loadMembers();
        loadChurches();
        loadGroups();
        loadIsolatedMembers();
        loadDepartments();
    }, [loadMembers, loadChurches, loadGroups, loadIsolatedMembers, loadDepartments, selectedChurch?.id]);

    // --- Ajout de l'état pour la recherche ---
    const [searchTerm, setSearchTerm] = useState("");

    // --- Ajout du filtre avancé ---
    const FILTER_OPTIONS = [
        { label: i18nService.t('dashboard.members.filters.all'), value: '' },
        { label: i18nService.t('dashboard.members.filters.networkResponsible'), value: 'Responsable réseau' },
        { label: i18nService.t('dashboard.members.filters.groupResponsibles'), value: 'Responsables de GR' },
        { label: i18nService.t('dashboard.members.filters.leader'), value: 'Leader' },
        { label: i18nService.t('dashboard.members.filters.allLeaders'), value: 'Leaders (tous)' },
        { label: i18nService.t('dashboard.members.filters.regular'), value: 'Régulier' },
        { label: i18nService.t('dashboard.members.filters.integration'), value: 'En intégration' },
        { label: i18nService.t('dashboard.members.filters.irregular'), value: 'Irrégulier' },
        { label: i18nService.t('dashboard.members.filters.governance'), value: 'Gouvernance' },
        { label: i18nService.t('dashboard.members.filters.ecodim'), value: 'Ecodim' },
        { label: i18nService.t('dashboard.members.filters.ecodimResponsible'), value: 'Responsable ecodim' },
        { label: i18nService.t('dashboard.members.filters.qualification12'), value: '12' },
        { label: i18nService.t('dashboard.members.filters.qualification144'), value: '144' },
        { label: i18nService.t('dashboard.members.filters.qualification1728'), value: '1728' },
        { label: i18nService.t('dashboard.members.filters.isolatedPeople'), value: 'Personnes isolées' },
    ];
    const [filter, setFilter] = useState('');

    // Protection : ne pas afficher les données si selectedChurch n'est pas valide
    if (!selectedChurch) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <Typography variant="h6" color="text.secondary">
                    {i18nService.t('dashboard.members.selectChurchMessage')}
                </Typography>
            </Box>
        );
    }

    const handleGrantRights = async (member) => {
        try {
            // Charger les rôles actuels de l'utilisateur
            const response = await roleService.getUserRoles(member.id || member._id);
            const currentRoles = response.data.assigned_roles || [];
            
            setRoleDialog({ 
                open: true, 
                member, 
                roles: currentRoles 
            });
        } catch (error) {
            logger.error('Erreur lors du chargement des rôles:', error);
            // Fallback: utiliser le rôle principal
            setRoleDialog({ 
                open: true, 
                member, 
                roles: member.role ? [member.role] : [] 
            });
        }
    };

    const handleRoleChange = (event) => {
        const value = event.target.value;
        setRoleDialog(prev => ({ 
            ...prev, 
            roles: typeof value === 'string' ? value.split(',') : value 
        }));
    };

    // Fonction pour trier les rôles par hiérarchie (du plus élevé au plus bas)
    const sortRolesByHierarchy = (roles) => {
        const roleHierarchy = {
            'SUPER_ADMIN': 6,
            'ADMIN': 5,
            'MANAGER': 4,
            'SUPERVISEUR': 3,
            'COLLECTEUR_CULTE': 2,
            'COLLECTEUR_RESEAUX': 2,
            'MEMBRE': 1
        };
        
        return roles.sort((a, b) => {
            const levelA = roleHierarchy[a.value] || 0;
            const levelB = roleHierarchy[b.value] || 0;
            return levelB - levelA; // Tri décroissant (du plus élevé au plus bas)
        });
    };

    // Fonction pour filtrer les rôles disponibles selon les permissions
    const getAvailableRoles = () => {
        let roles;
        if (permissions.isManager) {
            // Le manager ne peut attribuer que les rôles non-privilégiés
            roles = ROLE_OPTIONS.filter(role => 
                !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role.value)
            );
        } else {
            // SUPER_ADMIN et autres voient tous les rôles
            roles = ROLE_OPTIONS;
        }
        
        // Trier les rôles par hiérarchie
        return sortRolesByHierarchy(roles);
    };

    const handleRoleSubmit = async () => {
        try {
            // Vérification côté frontend pour le manager
            const restrictedRoles = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'];
            const hasRestrictedRole = roleDialog.roles.some(role => restrictedRoles.includes(role));
            
            if (permissions.isManager && hasRestrictedRole) {
                showError(i18nService.t('dashboard.members.errors.cannotAssignRole'));
                return;
            }

            // Utiliser le nouveau service pour assigner plusieurs rôles
            await roleService.assignMultipleRoles(
                roleDialog.member.id || roleDialog.member._id, 
                roleDialog.roles
            );
            
            showSuccess(i18nService.t('dashboard.members.success.roleUpdated'));
            setRoleDialog({ open: false, member: null, roles: [] });
            // Ne pas recharger automatiquement pour éviter d'affecter l'utilisateur connecté
            // await loadMembers();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || i18nService.t('dashboard.members.errors.roleAssignment');
            showError(errorMessage);
        }
    };

    const handleResetPassword = async (member) => {
        try {
            const res = await apiService.users.resetPassword(member.id || member._id);
            // Le mot de passe temporaire est maintenant généré côté client
            const tempPassword = res.data?.tempPassword || 'N/A';
            setResetDialog({ open: true, member, newPassword: tempPassword });
            showSuccess(i18nService.t('dashboard.members.success.passwordReset'));
        } catch (err) {
            const errorMessage = err.userMessage || err.message || i18nService.t('dashboard.members.errors.passwordReset');
            showError(errorMessage);
            setResetDialog({ open: false, member: null, newPassword: '' });
        }
    };

    const handleCloseResetDialog = () => setResetDialog({ open: false, member: null, newPassword: '' });

    const handleDeleteMember = (member) => {
        setDeleteDialog({ open: true, member });
    };

    const handleConfirmDelete = async () => {
        try {
            const memberId = deleteDialog.member.id || deleteDialog.member._id;
            const memberName = deleteDialog.member.username || deleteDialog.member.pseudo;
            
            await deleteUser(memberId);
            
            // Log de l'activité (asynchrone, non bloquant)
            logActivity(
                ActivityActions.DELETE,
                EntityTypes.USER,
                memberId,
                memberName,
                `Utilisateur supprimé: ${memberName}`
                ).catch(err => logger.warn('Erreur logging:', err));
            
            showSuccess(i18nService.t('dashboard.members.success.memberDeleted'));
            setDeleteDialog({ open: false, member: null });
            // Ne pas recharger automatiquement pour éviter d'affecter l'utilisateur connecté
            // await loadMembers();
        } catch (err) {
            // Utiliser le message sécurisé du hook
            const errorMessage = err.userMessage || err.message || i18nService.t('dashboard.members.errors.deletion');
            showError(errorMessage);
        }
    };

    const handleCloseDeleteDialog = () => setDeleteDialog({ open: false, member: null });

    const handleOpenCreateModal = () => {
        setEditMode(false);
        setMemberToEdit(null);
        setImagePreview(null);
        setSelectedImage(null);
        resetForm();
        setMemberModal(true);
    };

    const handleEditMember = (member) => {
        setEditMode(true);
        setMemberToEdit(member);
        
        // Réinitialiser l'image preview pour éviter les conflits
        setImagePreview(null);
        setSelectedImage(null);
        
        // Extraire les départements multiples
        const userDepartments = member.user_departments || [];
        const departementIds = userDepartments.map(ud => ud.department?.id || ud.department?._id || ud.department_id).filter(Boolean);
        
        // Pour le manager uniquement, forcer l'église et le rôle
        if (permissions.isManager) {
            setMemberForm({
                ...member,
                eglise_locale_id: user?.eglise_locale?.id || user?.eglise_locale || '',
                role: i18nService.t('dashboard.members.form.defaults.role'), // Le manager ne peut pas modifier le rôle
                departement_id: member.departement?.id || member.departement?._id || member.departement || '',
                departement_ids: departementIds,
            });
        } else {
            setMemberForm({
                ...member,
                eglise_locale_id: member.eglise_locale?.id || member.eglise_locale?._id || member.eglise_locale || '',
                departement_id: member.departement?.id || member.departement?._id || member.departement || '',
                departement_ids: departementIds,
            });
        }
        
        setMemberModal(true);
    };

    const handleMemberSubmit = async (e) => {
        e.preventDefault();
        
        // Validation des champs obligatoires
        const requiredFields = ['username', 'pseudo', 'genre', 'tranche_age', 'profession', 'ville_residence', 'origine', 'situation_matrimoniale', 'niveau_education'];
        const missingFields = requiredFields.filter(field => !memberForm[field] || memberForm[field].trim() === '');
        
        if (missingFields.length > 0) {
            showError(i18nService.t('dashboard.members.errors.requiredFields', { fields: missingFields.join(', ') }));
            return;
        }
        
        let imageUrl = memberForm.image || '';
        
        // Pour la création d'un nouvel utilisateur, on ne peut pas uploader l'image maintenant
        // On va d'abord créer l'utilisateur, puis uploader l'image
        if (selectedImage && !editMode) {
            // On va traiter l'upload après la création de l'utilisateur
        } else if (selectedImage && editMode && memberToEdit) {
            // Pour la modification d'un utilisateur existant
            try {
                const formData = new FormData();
                formData.append('image', selectedImage);
                
                const userId = memberToEdit.id || memberToEdit._id;
                const response = await apiService.users.uploadUserImage(userId, formData);
                
                imageUrl = response.data?.data?.image || response.data?.image;
                
                if (!imageUrl) {
                    throw new Error('URL de l\'image non reçue');
                }
            } catch (error) {
                toast.error('Erreur lors de l\'upload de l\'image');
                return;
            }
        }
        
        const dataToSend = {
            username: memberForm.username,
            pseudo: memberForm.pseudo,
            role: memberForm.role,
            genre: memberForm.genre,
            tranche_age: memberForm.tranche_age,
            profession: memberForm.profession,
            ville_residence: memberForm.ville_residence,
            origine: memberForm.origine,
            situation_matrimoniale: memberForm.situation_matrimoniale,
            niveau_education: memberForm.niveau_education,
            qualification: memberForm.qualification,
            email: memberForm.email,
            telephone: memberForm.telephone,
            adresse: memberForm.adresse,
            image: imageUrl,
            eglise_locale_id: memberForm.eglise_locale_id === '' ? null : memberForm.eglise_locale_id,
            departement_id: memberForm.departement_id === '' ? null : memberForm.departement_id,
            departement_ids: memberForm.departement_ids || []
        };

        // Pour le manager uniquement, forcer l'église et le rôle
        if (permissions.isManager) {
            dataToSend.eglise_locale_id = user?.eglise_locale?.id || user?.eglise_locale;
            dataToSend.role = i18nService.t('dashboard.members.form.defaults.role'); // Le manager ne peut attribuer que le rôle membre
        }

        try {
            if (editMode && memberToEdit) {
                const userId = memberToEdit.id || memberToEdit._id;
                const memberName = dataToSend.username;
                
                await updateUser(userId, dataToSend);
                
                // Log de l'activité (asynchrone, non bloquant)
                logActivity(
                    ActivityActions.UPDATE,
                    EntityTypes.USER,
                    userId,
                    memberName,
                    `Utilisateur modifié: ${memberName}`
                ).catch(err => logger.warn('Erreur logging:', err));
                
                showSuccess(i18nService.t('dashboard.members.success.updated'));
            } else {
                const newUser = await createUser(dataToSend);
                const memberId = newUser?.id || newUser?._id;
                const memberName = dataToSend.username;
                
                // Si une image était sélectionnée, l'uploader maintenant
                if (selectedImage) {
                    try {
                        const formData = new FormData();
                        formData.append('image', selectedImage);
                        
                        const response = await apiService.users.uploadUserImage(memberId, formData);
                        const uploadedImageUrl = response.data?.data?.image || response.data?.image;
                        
                        if (uploadedImageUrl) {
                            // Mettre à jour l'utilisateur avec l'URL de l'image uploadée
                            await updateUser(memberId, { image: uploadedImageUrl });
                        }
                    } catch (error) {
                        logger.warn('Erreur lors de l\'upload de l\'image:', error);
                        // On continue même si l'upload d'image échoue
                    }
                }
                
                // Log de l'activité (asynchrone, non bloquant)
                logActivity(
                    ActivityActions.CREATE,
                    EntityTypes.USER,
                    memberId,
                    memberName,
                    `Utilisateur créé: ${memberName}`
                ).catch(err => logger.warn('Erreur logging:', err));
                
                showSuccess(i18nService.t('dashboard.members.success.created'));
            }
            setMemberModal(false);
            setEditMode(false);
            setMemberToEdit(null);
            setImagePreview(null); // Réinitialiser immédiatement l'image preview
            setSelectedImage(null);
            resetForm(); // Réinitialiser le formulaire
            await loadMembers();
        } catch (err) {
            const errorMessage = err.userMessage || err.message || i18nService.t('dashboard.members.errors.save');
            showError(errorMessage);
        }
    };

    // Fonction de filtrage avancé
    const filterMembers = (members) => {
        if (!filter) return members;
        
        // Cas spéciaux pour "Leaders (tous)" et "Responsables Ecodim"
        if (filter === i18nService.t('dashboard.members.filters.allLeaders')) {
            const leaders = members.filter(m => {
                const qual = m.qualification || '';
                return qual === 'LEADER' || qual === 'RESPONSABLE_RESEAU' || 
                       qual === 'QUALIFICATION_12' || qual === '12' ||
                       qual === 'QUALIFICATION_144' || qual === '144' ||
                       qual === 'QUALIFICATION_1728' || qual === '1728';
            });
            return leaders;
        }
        
        if (filter === i18nService.t('dashboard.members.filters.ecodimResponsible')) {
            const responsablesEcodim = members.filter(m => {
                const qual = m.qualification || '';
                return qual.toLowerCase().includes('ecodim') && qual.toLowerCase().includes('responsable');
            });
            return responsablesEcodim;
        }
        
        if (filter === i18nService.t('dashboard.members.filters.isolatedPeople')) {
            return isolatedMembers;
        }
        
        if (filter === i18nService.t('dashboard.members.filters.governance')) {
            const gouvernanceMembers = members.filter(m => {
                const qual = m.qualification || '';
                return qual === 'GOUVERNANCE';
            });
            return gouvernanceMembers;
        }
        
        // Cas spécial pour "Responsables de GR"
        if (filter === i18nService.t('dashboard.members.filters.groupResponsibles')) {
            // On extrait tous les responsables des groupes (responsable1 et responsable2)
            const responsablesIds = new Set();
            groups.forEach(gr => {
                if (gr.responsable1) {
                    const id = gr.responsable1.id || gr.responsable1._id;
                    if (id) responsablesIds.add(id);
                }
                if (gr.responsable2) {
                    const id = gr.responsable2.id || gr.responsable2._id;
                    if (id) responsablesIds.add(id);
                }
            });
            const responsablesGR = members.filter(m => responsablesIds.has(m.id || m._id));
            return responsablesGR;
        }
        
        // Filtre standard sur qualification - gérer les différents formats
        const filteredMembers = members.filter(m => {
            const qual = m.qualification || '';
            const filterLower = filter.toLowerCase();
            
            // Gérer les qualifications avec et sans préfixe
            if (filterLower === i18nService.t('dashboard.members.filters.leader').toLowerCase() && (qual === 'LEADER' || qual === 'Leader')) return true;
            if (filterLower === i18nService.t('dashboard.members.filters.networkResponsible').toLowerCase() && (qual === 'RESPONSABLE_RESEAU' || qual === 'Responsable réseau')) return true;
            if (filterLower === i18nService.t('dashboard.members.filters.regular').toLowerCase() && (qual === 'REGULIER' || qual === 'Régulier')) return true;
            if (filterLower === i18nService.t('dashboard.members.filters.integration').toLowerCase() && (qual === 'EN_INTEGRATION' || qual === 'En intégration')) return true;
            if (filterLower === i18nService.t('dashboard.members.filters.irregular').toLowerCase() && (qual === 'IRREGULIER' || qual === 'Irrégulier')) return true;
            if (filterLower === i18nService.t('dashboard.members.filters.governance').toLowerCase() && qual === 'GOUVERNANCE') return true;
            if (filterLower === i18nService.t('dashboard.members.filters.ecodim').toLowerCase() && qual.toLowerCase().includes('ecodim')) return true;
            if (filterLower === i18nService.t('dashboard.members.filters.qualification12').toLowerCase() && formatQualification(qual) === '12') return true;
            if (filterLower === i18nService.t('dashboard.members.filters.qualification144').toLowerCase() && formatQualification(qual) === '144') return true;
            if (filterLower === i18nService.t('dashboard.members.filters.qualification1728').toLowerCase() && formatQualification(qual) === '1728') return true;
            
            return false;
        });
        
        return filteredMembers;
    };

    return (
        <Box sx={{ 
          width: '100%',
          overflow: 'hidden',
          overflowX: 'auto'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
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
                    {i18nService.t('dashboard.members.management')}
                  </Typography>
                  <Box sx={{ 
                    width: 80, 
                    height: 4, 
                    background: 'linear-gradient(90deg, #662d91, #9e005d, #9e005d)',
                    borderRadius: 2
                  }} />
                </Box>
                <FormControl sx={{ minWidth: 250, mx: 3 }}>
                    <InputLabel id="members-filter-label">{i18nService.t('dashboard.members.filters.title')}</InputLabel>
                    <Select
                        id="members-filter"
                        name="filter"
                        value={filter}
                        label={i18nService.t('dashboard.members.filters.title')}
                        labelId="members-filter-label"
                        onChange={e => setFilter(e.target.value)}
                        autoComplete="off"
                    >
                        {FILTER_OPTIONS.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateModal} disabled={!canCreateUsers}>{i18nService.t('dashboard.members.newMember')}</Button>
            </Box>
            <TextField data-aos="fade-up"
                fullWidth
                id="members-search"
                name="search"
                variant="outlined"
                placeholder={i18nService.t('dashboard.members.searchPlaceholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoComplete="off"
                InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 3 }}
            />
            {loading ? (
                <Loading titre={i18nService.t('dashboard.members.loading.members')} />
            ) : error && error !== 'success' ? (
                <SecureErrorMessage error={error} title={i18nService.t('dashboard.members.loading.error')} />
            ) : (
                <>
                    {/* Affichage de l'effectif filtré */}
                    <Typography data-aos="fade-up" sx={{ mb: 1, fontWeight: 'bold' }}>
                        {i18nService.t('dashboard.members.foundCount', { count: Array.isArray(members)
                                ? filterMembers(members).filter(member =>
                                    member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).length
                                : 0
                        })}
                    </Typography>
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
                                    <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.members.table.name')}</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.members.table.email')}</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.members.table.phone')}</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.members.table.qualification')}</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.members.table.role')}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>{i18nService.t('dashboard.members.table.actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {Array.isArray(members) && filterMembers(members)
                                .filter(member =>
                                    member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map(member => (
                                    <TableRow key={member.id || member._id}>
                                        <TableCell>{member.username}</TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>{member.telephone || '-'}</TableCell>
                                        <TableCell>
                                          <Typography 
                                            component="span" 
                                            variant="caption" 
                                            sx={{ 
                                              fontWeight: 'bold',
                                              fontSize: '0.75rem'
                                            }}
                                          >
                                            {formatQualificationWithFallback(member.qualification, '-')}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>{formatRoleWithFallback(member.role)}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title={i18nService.t('dashboard.members.actions.assignRole')}>
                                                <IconButton 
                                                    size="small" 
                                                    color="secondary" 
                                                    onClick={() => handleGrantRights(member)}
                                                    disabled={!canUpdateUsers}
                                                    title={!canUpdateUsers ? 
                                                        (canAssignManagerRole ? i18nService.t('dashboard.members.permissions.managerFullRights') : i18nService.t('dashboard.members.permissions.adminReadOnly')) 
                                                        : ""}
                                                >
                                                    <SecurityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={i18nService.t('dashboard.members.actions.resetPassword')}>
                                                <IconButton 
                                                    size="small" 
                                                    color="warning" 
                                                    onClick={() => handleResetPassword(member)}
                                                    disabled={!canUpdateUsers}
                                                    title={!canUpdateUsers ? 
                                                        (canAssignManagerRole ? i18nService.t('dashboard.members.permissions.managerFullRights') : i18nService.t('dashboard.members.permissions.adminReadOnly')) 
                                                        : ""}
                                                >
                                                    <LockResetIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={i18nService.t('dashboard.members.actions.edit')}>
                                                <IconButton 
                                                    size="small" 
                                                    color="info" 
                                                    onClick={() => handleEditMember(member)}
                                                    disabled={!canUpdateUsers}
                                                    title={!canUpdateUsers ? 
                                                        (canAssignManagerRole ? i18nService.t('dashboard.members.permissions.managerFullRights') : i18nService.t('dashboard.members.permissions.adminReadOnly')) 
                                                        : ""}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={i18nService.t('dashboard.members.actions.delete')}>
                                                <IconButton 
                                                    size="small" 
                                                    color="error" 
                                                    onClick={() => handleDeleteMember(member)}
                                                    disabled={!canDeleteUsers}
                                                    title={!canDeleteUsers ? 
                                                        (canAssignManagerRole ? i18nService.t('dashboard.members.permissions.managerFullRights') : i18nService.t('dashboard.members.permissions.adminReadOnly')) 
                                                        : ""}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
            {/* Dialog attribution de rôles multiples */}
            <Dialog 
              open={roleDialog.open} 
              onClose={() => setRoleDialog({ open: false, member: null, roles: [] })} 
              maxWidth="sm" 
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
                    {i18nService.t('dashboard.members.roleDialog.title')} - {roleDialog.member?.username}
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="role-select-label">Sélectionner les rôles</InputLabel>
                        <Select
                            id="role-select"
                            name="roles"
                            labelId="role-select-label"
                            multiple
                            value={roleDialog.roles}
                            label="Sélectionner les rôles"
                            onChange={handleRoleChange}
                            autoComplete="off"
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Box
                                            key={value}
                                            sx={{
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            {getAvailableRoles().find(role => role.value === value)?.label || value}
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        >
                            {getAvailableRoles().map(role => (
                                <MenuItem key={role.value} value={role.value}>
                                    {role.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Vous pouvez sélectionner plusieurs rôles. Le rôle le plus élevé sera défini comme rôle principal.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRoleDialog({ open: false, member: null, roles: [] })}>
                        Annuler
                    </Button>
                    <Button onClick={handleRoleSubmit} variant="contained">
                        Assigner les rôles
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog reset mot de passe */}
            <Dialog 
              open={resetDialog.open} 
              onClose={handleCloseResetDialog}
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
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                    <LockResetIcon sx={{ mr: 1, color: '#662d91' }} />
                    {i18nService.t('dashboard.members.resetPasswordDialog.title')}
                </DialogTitle>
                <DialogContent sx={{ minWidth: 340 }}>
                    <Typography sx={{ mb: 1 }}>
                        {i18nService.t('dashboard.members.resetPasswordDialog.newPasswordFor', { username: resetDialog.member?.username })}
                    </Typography>
                    <Box
                        sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            border: '1px solid #e0e0e0',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ wordBreak: 'break-all', letterSpacing: 1, fontWeight: 700, color: 'primary.main', flex: 1 }}
                        >
                            {resetDialog.newPassword}
                        </Typography>
                        <Tooltip title={i18nService.t('dashboard.members.resetPasswordDialog.copyPassword')}>
                            <IconButton
                                color="primary"
                                onClick={() => {
                                    navigator.clipboard.writeText(resetDialog.newPassword);
                                }}
                                sx={{ ml: 1 }}
                            >
                                <LockResetIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        {i18nService.t('dashboard.members.resetPasswordDialog.passwordInfo')}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseResetDialog} variant="contained" color="primary" sx={{ fontWeight: 600 }}>
                        {i18nService.t('dashboard.members.resetPasswordDialog.close')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={memberModal}
                onClose={() => {
                    setMemberModal(false);
                    setEditMode(false);
                    setMemberToEdit(null);
                    
                    // Pour le manager, forcer l'église et le rôle lors de la réinitialisation
                    if (canAssignManagerRole) {
                        setMemberForm({
                            username: '',
                            pseudo: '',
                            role: 'MEMBRE',
                            genre: '',
                            tranche_age: '',
                            profession: '',
                            ville_residence: '',
                            origine: '',
                            situation_matrimoniale: '',
                            niveau_education: '',
                            eglise_locale_id: user?.eglise_locale?.id || user?.eglise_locale || '',
                            sert_departement: 'Non',
                            departement_id: '',
                            departement_ids: [],
                            qualification: 'EN_INTEGRATION',
                            email: '',
                            telephone: '',
                            adresse: '',
                            image: ''
                        });
                    } else {
                        setMemberForm({
                            username: '',
                            pseudo: '',
                            role: 'MEMBRE',
                            genre: '',
                            tranche_age: '',
                            profession: '',
                            ville_residence: '',
                            origine: '',
                            situation_matrimoniale: '',
                            niveau_education: '',
                            eglise_locale_id: '',
                            sert_departement: 'Non',
                            departement_id: '',
                            departement_ids: [],
                            qualification: 'EN_INTEGRATION',
                            email: '',
                            telephone: '',
                            adresse: '',
                            image: ''
                        });
                    }
                    setSelectedImage(null);
                    setImagePreview(null);
                }}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        width: '100%',
                        maxWidth: '800px',
                        margin: '20px',
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
                  {editMode ? i18nService.t('dashboard.members.dialog.editTitle') : i18nService.t('dashboard.members.dialog.createTitle')}
                </DialogTitle>
                <form onSubmit={handleMemberSubmit}>
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            alignItems: 'center',
                            width: '100%',
                            maxWidth: '750px'
                        }}>
                            <Grid
                                container
                                spacing={2}
                                sx={{
                                    margin: 0,
                                    alignItems: 'center'
                                }}>
                                {/* Informations personnelles */}

                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        id="member-form-username"
                                        name="username"
                                        sx={{ width: 350 }}
                                        label={i18nService.t('dashboard.members.form.username')}
                                        value={memberForm.username}
                                        onChange={(e) => setMemberForm({ ...memberForm, username: e.target.value })}
                                        margin="normal"
                                        required
                                        autoComplete="username"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        id="member-form-pseudo"
                                        name="pseudo"
                                        sx={{ width: 350 }}
                                        label={i18nService.t('dashboard.members.form.pseudo')}
                                        value={memberForm.pseudo}
                                        onChange={(e) => setMemberForm({ ...memberForm, pseudo: e.target.value })}
                                        margin="normal"
                                        required
                                        autoComplete="nickname"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel id="member-form-genre-label">{i18nService.t('dashboard.members.form.genre')}</InputLabel>
                                        <Select
                                            id="member-form-genre"
                                            name="genre"
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.genre}
                                            onChange={(e) => setMemberForm({ ...memberForm, genre: e.target.value })}
                                            labelId="member-form-genre-label"
                                            autoComplete="sex"
                                        >
                                            {GENRE_OPTIONS.map((genre) => (
                                                <MenuItem key={genre.value} value={genre.value}>{genre.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Informations démographiques */}

                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel id="member-form-age-range-label">{i18nService.t('dashboard.members.form.ageRange')}</InputLabel>
                                        <Select
                                            id="member-form-age-range"
                                            name="tranche_age"
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.tranche_age}
                                            onChange={(e) => setMemberForm({ ...memberForm, tranche_age: e.target.value })}
                                            labelId="member-form-age-range-label"
                                            autoComplete="bday"
                                        >
                                            {TRANCHE_AGE_OPTIONS.map((tranche) => (
                                                <MenuItem key={tranche.value} value={tranche.value}>{tranche.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        id="member-form-profession"
                                        name="profession"
                                        sx={{ width: 350 }}
                                        label={i18nService.t('dashboard.members.form.profession')}
                                        value={memberForm.profession}
                                        onChange={(e) => setMemberForm({ ...memberForm, profession: e.target.value })}
                                        margin="normal"
                                        required
                                        autoComplete="organization-title"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        id="member-form-residence-city"
                                        name="ville_residence"
                                        sx={{ width: 350 }}
                                        label={i18nService.t('dashboard.members.form.residenceCity')}
                                        value={memberForm.ville_residence}
                                        onChange={(e) => setMemberForm({ ...memberForm, ville_residence: e.target.value })}
                                        margin="normal"
                                        required
                                        autoComplete="address-level2"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel id="member-form-origin-label">{i18nService.t('dashboard.members.form.origin')}</InputLabel>
                                        <Select
                                            id="member-form-origin"
                                            name="origine"
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.origine}
                                            onChange={(e) => setMemberForm({ ...memberForm, origine: e.target.value })}
                                            labelId="member-form-origin-label"
                                            autoComplete="country"
                                        >
                                            {COUNTRIES.map((country) => (
                                                <MenuItem key={country.value} value={country.value}>{country.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel id="member-form-marital-status-label">{i18nService.t('dashboard.members.form.maritalStatus')}</InputLabel>
                                        <Select
                                            id="member-form-marital-status"
                                            name="situation_matrimoniale"
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.situation_matrimoniale}
                                            onChange={(e) => setMemberForm({ ...memberForm, situation_matrimoniale: e.target.value })}
                                            labelId="member-form-marital-status-label"
                                            autoComplete="off"
                                        >
                                            {SITUATION_MATRIMONIALE_OPTIONS.map((situation) => (
                                                <MenuItem key={situation.value} value={situation.value}>{situation.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {/* Formation */}

                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel id="member-form-education-level-label">{i18nService.t('dashboard.members.form.educationLevel')}</InputLabel>
                                        <Select
                                            id="member-form-education-level"
                                            name="niveau_education"
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.niveau_education}
                                            onChange={(e) => setMemberForm({ ...memberForm, niveau_education: e.target.value })}
                                            labelId="member-form-education-level-label"
                                            autoComplete="off"
                                        >
                                            {NIVEAU_EDUCATION_OPTIONS.map((niveau) => (
                                                <MenuItem key={niveau.value} value={niveau.value}>{niveau.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Église et Département */}

                                {/* Champ église - visible pour Super Admin et Admin */}
                                {canModifyChurchField && (
                                    <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <FormControl sx={{ width: 350 }} margin="normal" required>
                                            <InputLabel id="member-form-local-church-label">{i18nService.t('dashboard.members.form.localChurch')}</InputLabel>
                                            <Select
                                                id="member-form-local-church"
                                                name="eglise_locale_id"
                                                sx={{ minWidth: 350 }}
                                                value={memberForm.eglise_locale_id}
                                                onChange={(e) => setMemberForm({ ...memberForm, eglise_locale_id: e.target.value })}
                                                labelId="member-form-local-church-label"
                                                autoComplete="off"
                                            >
                                                {churches.map((church) => (
                                                    <MenuItem key={church.id || church._id} value={church.id || church._id}>{church.nom}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}

                                {/* Champ rôle - masqué pour le manager */}
                                {!canAssignManagerRole && (
                                    <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <FormControl sx={{ width: 350 }} margin="normal" required>
                                            <InputLabel id="member-form-role-label">Rôle</InputLabel>
                                            <Select
                                                id="member-form-role"
                                                name="role"
                                                sx={{ minWidth: 350 }}
                                                value={memberForm.role}
                                                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                                                labelId="member-form-role-label"
                                                autoComplete="off"
                                            >
                                                {ROLE_OPTIONS.map((role) => (
                                                    <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                                {/* Sert dans un département : seulement en création */}
                                {!editMode && (
                                    <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <FormControl sx={{ width: 350 }} margin="normal" required>
                                            <InputLabel id="member-form-serves-department-label">{i18nService.t('dashboard.members.form.servesDepartment')}</InputLabel>
                                            <Select
                                                id="member-form-serves-department"
                                                name="sert_departement"
                                                sx={{ minWidth: 350 }}
                                                value={memberForm.sert_departement}
                                                onChange={(e) => setMemberForm({ ...memberForm, sert_departement: e.target.value, departement_id: e.target.value === 'Non' ? '' : memberForm.departement_id })}
                                                labelId="member-form-serves-department-label"
                                                autoComplete="off"
                                            >
                                                                                            <MenuItem value={i18nService.t('dashboard.members.form.yes')}>{i18nService.t('dashboard.members.form.yes')}</MenuItem>
                                            <MenuItem value={i18nService.t('dashboard.members.form.no')}>{i18nService.t('dashboard.members.form.no')}</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                                {/* Départements multiples : toujours affiché en modification, ou si sert_departement === 'Oui' en création */}
                                {(editMode || memberForm.sert_departement === 'Oui') && (
                                    <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <FormControl sx={{ width: 350 }} margin="normal">
                                            <InputLabel id="member-form-departments-label">{i18nService.t('dashboard.members.form.departments')}</InputLabel>
                                            <Select
                                                id="member-form-departments"
                                                name="departement_ids"
                                                multiple
                                                sx={{ minWidth: 350 }}
                                                value={memberForm.departement_ids || []}
                                                onChange={(e) => setMemberForm({ ...memberForm, departement_ids: e.target.value })}
                                                labelId="member-form-departments-label"
                                                autoComplete="off"
                                                renderValue={(selected) => {
                                                    if (selected.length === 0) return i18nService.t('dashboard.members.form.noDepartment');
                                                    if (selected.length === 1) {
                                                        const dept = departments.find(d => (d.id || d._id) === selected[0]);
                                                        return dept ? dept.nom : selected[0];
                                                    }
                                                    return `${selected.length} départements sélectionnés`;
                                                }}
                                            >
                                                {departmentsError && (
                                                    <Alert severity="error">{departmentsError}</Alert>
                                                )}
                                                {departments.length === 0 && !departmentsError && (
                                                    <Alert severity="info">{i18nService.t('dashboard.members.form.noDepartmentsFound')}</Alert>
                                                )}
                                                {Array.isArray(departments) && departments.map((dept) => (
                                                    <MenuItem key={dept.id || dept._id} value={dept.id || dept._id}>
                                                        {dept.nom}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel id="member-form-qualification-label">{i18nService.t('dashboard.members.form.qualification')}</InputLabel>
                                        <Select
                                            id="member-form-qualification"
                                            name="qualification"
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.qualification}
                                            onChange={(e) => setMemberForm({ ...memberForm, qualification: e.target.value })}
                                            labelId="member-form-qualification-label"
                                            autoComplete="off"
                                        >
                                            {QUALIFICATION_OPTIONS.map((qual) => (
                                                <MenuItem key={qual.value} value={qual.value}>{qual.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Contact */}

                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        id="member-form-email"
                                        name="email"
                                        sx={{ width: 350 }}
                                        type="email"
                                        label={i18nService.t('dashboard.members.form.email')}
                                        value={memberForm.email}
                                        onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                                        margin="normal"
                                        required
                                        autoComplete="email"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        id="member-form-phone"
                                        name="telephone"
                                        sx={{ width: 350 }}
                                        label={i18nService.t('dashboard.members.form.phone')}
                                        value={memberForm.telephone}
                                        onChange={(e) => setMemberForm({ ...memberForm, telephone: e.target.value })}
                                        margin="normal"
                                        required
                                        autoComplete="tel"
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        id="member-form-address"
                                        name="adresse"
                                        sx={{ width: 350 }}
                                        label={i18nService.t('dashboard.members.form.address')}
                                        value={memberForm.adresse}
                                        onChange={(e) => setMemberForm({ ...memberForm, adresse: e.target.value })}
                                        margin="normal"
                                        required
                                        multiline
                                        rows={3}
                                        autoComplete="street-address"
                                    />
                                </Grid>
                                {/* Upload d'image de profil */}
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Box sx={{ width: 350, mt: 2 }}>
                                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            {i18nService.t('dashboard.members.form.profileImage')}
                                        </Typography>
                                        
                                        {/* Aperçu de l'image */}
                                        {(memberForm.image || imagePreview) && (
                                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                                                <img 
                                                    src={imagePreview || getImageUrl(memberForm.image)} 
                                                    alt="Aperçu" 
                                                    style={{ 
                                                        width: 100, 
                                                        height: 100, 
                                                        objectFit: 'cover', 
                                                        borderRadius: '50%',
                                                        border: '2px solid #e0e0e0'
                                                    }} 
                                                    onError={(e) => {
                                                        // Erreur de chargement de l'image dans le formulaire membre
                                                    }}
                                                />
                                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                                    {imagePreview ? 'Nouvelle image' : 'Image actuelle'}
                                                </Typography>
                                            </Box>
                                        )}
                                        
                                        {/* Bouton d'upload */}
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="image-upload"
                                            type="file"
                                            onChange={handleImageSelect}
                                        />
                                        <label htmlFor="image-upload">
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                startIcon={<AddIcon />}
                                                fullWidth
                                                sx={{ mb: 1 }}
                                            >
                                                {memberForm.image ? 'Changer l\'image' : 'Ajouter une image'}
                                            </Button>
                                        </label>
                                        
                                        {memberForm.image && (
                                            <Button
                                                variant="text"
                                                color="error"
                                                onClick={handleRemoveImage}
                                                fullWidth
                                                size="small"
                                            >
                                                Supprimer l'image
                                            </Button>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setMemberModal(false)}>{i18nService.t('dashboard.members.roleDialog.cancel')}</Button>
                        <Button type="submit" variant="contained" color="primary">{editMode ? i18nService.t('dashboard.members.dialog.update') : i18nService.t('dashboard.members.dialog.create')}</Button>
                    </DialogActions>
                </form>
            </Dialog>
            {/* Dialog de confirmation suppression */}
            <DeleteConfirmDialog
                open={deleteDialog.open}
                title={i18nService.t('dashboard.members.deleteDialog.title')}
                content={memberToDelete ? `${i18nService.t('dashboard.members.deleteDialog.content', { memberName: memberToDelete.username })}` : `${i18nService.t('dashboard.members.deleteDialog.contentGeneric')}`}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
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

export default Membres;
