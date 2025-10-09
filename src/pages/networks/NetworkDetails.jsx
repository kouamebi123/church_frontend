import React, { useState, useEffect } from 'react';
import i18nService from '@services/i18nService';
import { handleApiError } from '@utils/errorHandler';
import { usePermissions } from '@hooks/usePermissions';
import { useParams } from 'react-router-dom';
import AccessControl from '@components/AccessControl';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  IconButton,
  FormControlLabel,
  Switch,
  Tooltip,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Group as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import Navbar from '@components/Navbar';
import Loading from '@components/Loading';
import SecureErrorMessage from '@components/common/SecureErrorMessage';
import DeleteConfirmDialog from '@components/DeleteConfirmDialog';
import PrevisionnelModal from '@components/PrevisionnelModal';
import AssistanceModal from '@components/AssistanceModal';
import HistoriqueCulteModal from '@components/HistoriqueCulteModal';
import { GENRE_OPTIONS, TRANCHE_AGE_OPTIONS, SITUATION_MATRIMONIALE_OPTIONS, NIVEAU_EDUCATION_OPTIONS, QUALIFICATION_OPTIONS, STATUS_OPTIONS } from '@constants/enums';
import { COUNTRIES } from '@constants/countries';
import { apiService, previsionnelService, assistanceService } from '../../services';
import { useAuth } from '@hooks/useAuth';
import { useSelectedChurch } from '@hooks/useSelectedChurch';
import { toast } from 'react-toastify';
import { formatQualificationWithFallback } from '@utils/qualificationFormatter';
import { getImageUrl } from '../../config/apiConfig';
import logger from '@utils/logger';


const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
  borderRadius: '20px',
  border: '1px solid rgba(102, 45, 145, 0.1)',
  boxShadow: '0 4px 20px rgba(102, 45, 145, 0.08)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 15px 50px rgba(102, 45, 145, 0.18)'
  }
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  height: '100%',
  minWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
  borderRadius: '16px',
  border: '1px solid rgba(102, 45, 145, 0.1)',
  boxShadow: '0 4px 16px rgba(102, 45, 145, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 12px 32px rgba(102, 45, 145, 0.15)'
  }
}));

// Configuration des statistiques du réseau
const getNetworkStatsConfig = (stats) => [
  { 
    key: '12',
    label: '12', 
    value: stats['12'] || 0
  },
  { 
    key: '144',
    label: '144', 
    value: stats['144'] || 0
  },
  { 
    key: '1728',
    label: '1728', 
    value: stats['1728'] || 0
  },
  { 
    key: 'totalGroups',
    label: i18nService.t('networks.details.stats.totalGroups'), 
    value: stats.totalGroups || 0
  },
  { 
    key: 'Responsables de GR',
    label: i18nService.t('networks.details.stats.groupResponsibles'), 
    value: stats['Responsables de GR'] || 0
  },
  { 
    key: 'Leader',
    label: i18nService.t('networks.details.stats.leaders'), 
    value: stats['Leader'] || 0
  },
  { 
    key: 'Leader (Tous)',
    label: i18nService.t('networks.details.stats.allLeaders'), 
    value: stats['Leader (Tous)'] || 0
  },
  { 
    key: 'Membre simple',
    label: i18nService.t('networks.details.stats.simpleMembers'), 
    value: stats['Membre simple'] || 0
  }
].filter(stat => stat.value > 0); // Filtrer seulement les statistiques qui ont une valeur > 0


// Fonction pour formater les noms selon la logique demandée
const formatResponsableName = (username) => {
  if (!username) return '';
  
  const statusPrefixes = STATUS_OPTIONS.map(option => option.value);
  const words = username.split(' ');
  
  // Vérifier si le premier mot est un préfixe de statut
  const firstWord = words[0];
  const isStatusPrefix = statusPrefixes.includes(firstWord);
  
  if (isStatusPrefix) {
    // Si préfixe existe, prendre le premier nom après le préfixe
    return words.length >= 2 ? words[1] : firstWord;
  } else {
    // Si préfixe n'existe pas, prendre le premier nom seulement
    return words[0];
  }
};

const NetworkDetails = () => {
  const { user, isAuthenticated } = useAuth();
  const { id: networkId } = useParams();
  const { selectedChurch } = useSelectedChurch();
  
  // Initialiser le service i18n
  useEffect(() => {
    i18nService.init();
  }, []);
  const { 
    canCreateGroups, 
    canUpdateGroups, 
    canDeleteGroups, 
    canUpdateUsers, 
    isAdmin,
    isManager,
    isSuperAdmin,
    isCollecteurReseaux
  } = usePermissions();
  
  const permissions = { isAdmin, isManager, isSuperAdmin, isCollecteurReseaux };
  
  // Fonction helper pour générer le message d'aide approprié
  const getHelpMessage = (permission) => {
    if (!permission && permissions.isAdmin) {
      return i18nService.t('dashboard.members.permissions.adminReadOnly');
    }
    if (!permission && permissions.isManager) {
      return i18nService.t('dashboard.members.permissions.managerFullRights');
    }
    return "";
  };
  
  // Hooks pour charger dynamiquement les églises et départements
  const [churches, setChurches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);


  useEffect(() => {
    // Utiliser le service API centralisé avec gestion d'erreur améliorée
    const loadInitialData = async () => {
      try {
        const [churchesRes, departmentsRes] = await Promise.all([
          apiService.churches.getAll(),
          apiService.departments.getAll()
        ]);
        
        // Gérer la structure de réponse de l'API
        const churchesData = churchesRes.data?.data || churchesRes.data || [];
        const departmentsData = departmentsRes.data?.data || departmentsRes.data || [];
        setChurches(Array.isArray(churchesData) ? churchesData : []);
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
              } catch (error) {
          // Erreur lors du chargement des données initiales - Supprimé pour la production
          setChurches([]);
          setDepartments([]);
        }
    };

    loadInitialData();
  }, []);

  // ...
  const [selectedResponsable1, setSelectedResponsable1] = useState('');
  const [selectedResponsable2, setSelectedResponsable2] = useState('');
  const [selectedQualification, setSelectedQualification] = useState('');
  const [selectedSuperieurHierarchique, setSelectedSuperieurHierarchique] = useState('');
  const [availableSuperieurs, setAvailableSuperieurs] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');

  // Fonction pour calculer les supérieurs hiérarchiques disponibles
  const calculateAvailableSuperieurs = (qualification) => {
    if (!qualification || !networkData) return [];

    const superieurs = [];
    
    // Extraire la valeur numérique de la qualification
    const qualValue = parseInt(qualification.replace('QUALIFICATION_', ''));
    
    
    if (qualValue === 12) {
      // Qualification 12 → Responsables du réseau
      if (networkData.reseau?.responsable1) {
        superieurs.push({
          id: networkData.reseau.responsable1.id || networkData.reseau.responsable1._id,
          username: networkData.reseau.responsable1.username,
          type: 'network_responsible',
          label: `${networkData.reseau.responsable1.username} - ${i18nService.t('networks.details.networkResponsible')}`
        });
      }
      if (networkData.reseau?.responsable2) {
        superieurs.push({
          id: networkData.reseau.responsable2.id || networkData.reseau.responsable2._id,
          username: networkData.reseau.responsable2.username,
          type: 'network_responsible',
          label: `${networkData.reseau.responsable2.username} - ${i18nService.t('networks.details.networkResponsible')}`
        });
      }
    } else {
      // Autres qualifications → Groupes dont les responsables ont qualification = qualification/12
      const requiredQualification = qualValue / 12;
      const requiredQualString = `QUALIFICATION_${requiredQualification}`;
      
      // Filtrer les groupes dont les responsables ont la qualification requise
      const matchingGroups = networkData.grs?.filter(groupe => {
        const responsable1Qual = groupe.responsable1?.qualification;
        const responsable2Qual = groupe.responsable2?.qualification;
        return responsable1Qual === requiredQualString || responsable2Qual === requiredQualString;
      }) || [];
      
      matchingGroups.forEach(groupe => {
        // Ajouter responsable1 s'il a la bonne qualification
        if (groupe.responsable1 && groupe.responsable1.qualification === requiredQualString) {
          superieurs.push({
            id: groupe.responsable1.id || groupe.responsable1._id,
            username: groupe.responsable1.username,
            type: 'group_responsible',
            qualification: groupe.responsable1.qualification,
            label: `${groupe.responsable1.username} - ${groupe.responsable1.qualification?.replace('QUALIFICATION_', '') || i18nService.t('networks.details.group')}`
          });
        }
        // Ajouter responsable2 s'il a la bonne qualification
        if (groupe.responsable2 && groupe.responsable2.qualification === requiredQualString) {
          superieurs.push({
            id: groupe.responsable2.id || groupe.responsable2._id,
            username: groupe.responsable2.username,
            type: 'group_responsible',
            qualification: groupe.responsable2.qualification,
            label: `${groupe.responsable2.username} - ${groupe.responsable2.qualification?.replace('QUALIFICATION_', '') || i18nService.t('networks.details.group')}`
          });
        }
      });
    }
    
    return superieurs;
  };

  // Fonction pour réinitialiser les champs du modal
  const resetModalFields = () => {
    setSelectedResponsable1('');
    setSelectedResponsable2('');
    setSelectedQualification('');
    setSelectedSuperieurHierarchique('');
    setAvailableSuperieurs([]);
    setNewGroupName('');
  };

  // États pour les modales
  const [addGrModal, setAddGrModal] = useState(false);
  const [editGrModal, setEditGrModal] = useState(false);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [newMemberMode, setNewMemberMode] = useState(false);
  const [selectedGr, setSelectedGr] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [previsionnelModal, setPrevisionnelModal] = useState(false);
  const [assistanceModal, setAssistanceModal] = useState(false);
  const [historiqueModal, setHistoriqueModal] = useState(false);
  const [previsionnelLoading, setPrevisionnelLoading] = useState(false);
  const [assistanceLoading, setAssistanceLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [memberForm, setMemberForm] = useState({
    username: '',
    pseudo: '',
    email: '',
    password: '',
    role: 'MEMBRE',
    genre: '',
    tranche_age: '',
    profession: '',
    ville_residence: '',
    origine: '',
    situation_matrimoniale: '',
    niveau_education: '',
    departement: '',
    departement_ids: [],
    qualification: '',
    telephone: '',
    adresse: '',
    image: ''
  });

  const [editMemberModal, setEditMemberModal] = useState(false);
  const [editMemberForm, setEditMemberForm] = useState({
    username: '',
    pseudo: '',
    genre: '',
    tranche_age: '',
    profession: '',
    ville_residence: '',
    origine: '',
    situation_matrimoniale: '',
    niveau_education: '',
    departement: '',
    departement_ids: [],
    qualification: '',
    email: '',
    telephone: '',
    adresse: '',
    image: ''
  });
  const [sertDepartement, setSertDepartement] = useState(false);
  
  // États pour l'upload d'images
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // États pour l'édition d'images
  const [editSelectedImage, setEditSelectedImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Surveiller les changements du formulaire d'édition
  useEffect(() => {
    // Debug du formulaire - Supprimé pour la production
  }, [editMemberForm]);

  // Fonctions pour l'upload d'images
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    
    // Réinitialiser la valeur de l'input pour permettre la re-sélection du même fichier
    event.target.value = '';
    
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error(i18nService.t('errors.validation.invalidImageType'));
        return;
      }
      
      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(i18nService.t('errors.validation.imageTooLarge'));
        return;
      }
      
      setSelectedImage(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setMemberForm(prev => ({ ...prev, image: '' }));
  };

  // Fonctions pour l'édition d'images
  const handleEditImageSelect = (event) => {
    const file = event.target.files[0];
    
    // Réinitialiser la valeur de l'input pour permettre la re-sélection du même fichier
    event.target.value = '';
    
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error(i18nService.t('errors.validation.invalidImageType'));
        return;
      }
      
      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(i18nService.t('errors.validation.imageTooLarge'));
        return;
      }
      
      setEditSelectedImage(file);
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleEditRemoveImage = () => {
    setEditSelectedImage(null);
    setEditImagePreview(null);
    setEditMemberForm(prev => ({ ...prev, image: '' }));
  };

  // État pour les données réseau
  const [networkData, setNetworkData] = useState({
    reseau: {},
    stats: [],
    grs: [],
    members: {},
    available_users: []
  });
  const [loading, setLoading] = useState(true);
  
  // État pour les responsables disponibles
  const [availableResponsables, setAvailableResponsables] = useState([]);

  // Déclaration de fetchData accessible à tous les handlers
  const fetchData = async () => {
    try {
              // Vérifier que networkId est valide
        if (!networkId) {
          setError(i18nService.t('networks.details.missingNetworkId'));
          return;
        }

          // Debug des données - Supprimé pour la production

      // Déterminer le filtre d'église à utiliser
      let churchFilter = {};
      
      // Priorité 1: Église sélectionnée dans le filtre global
      if (selectedChurch?.id || selectedChurch?._id) {
        const selectedChurchId = selectedChurch.id || selectedChurch._id;
                  // Debug de l'église sélectionnée - Supprimé pour la production
        churchFilter = { churchId: selectedChurchId };
      }
      // Priorité 2: Église de l'utilisateur connecté (fallback)
      else if (user?.eglise_locale) {
        // Extraire l'ID de l'église (peut être un objet ou une chaîne)
        let churchId;
        if (typeof user.eglise_locale === 'object') {
          churchId = user.eglise_locale.id || user.eglise_locale._id;
        } else if (typeof user.eglise_locale === 'string') {
          churchId = user.eglise_locale;
        }
        
        // S'assurer que l'ID est valide
        if (churchId && churchId !== 'undefined' && churchId !== 'null') {
          // Debug de l'église utilisateur - Supprimé pour la production
          churchFilter = { churchId };
        }
      }
      
      // Si pas de filtre d'église mais que l'utilisateur est super admin, 
      // on peut charger les utilisateurs de toutes les églises
      if (Object.keys(churchFilter).length === 0 && permissions.isSuperAdmin) {
        // Debug du chargement global - Supprimé pour la production
        churchFilter = {}; // Pas de filtre = tous les utilisateurs
      }
      
      // Charger les données une par une pour éviter les problèmes avec Promise.all
      let reseauData = {};
      let statsData = {};
      let grsData = [];
      let membersData = [];
      let availableUsersData = [];

      try {
        const reseauRes = await apiService.networks.getById(networkId);
        reseauData = reseauRes.data?.data || reseauRes.data || {};
        // Debug du réseau chargé - Supprimé pour la production
              } catch (error) {
          // Erreur lors du chargement du réseau - Supprimé pour la production
        }

      try {
        const statsRes = await apiService.networks.getStatsById(networkId);
        statsData = statsRes.data?.data || statsRes.data || {};
        // Debug des stats - Supprimé pour la production
      } catch (error) {
        // Erreur lors du chargement des stats - Supprimé pour la production
      }

      try {
        const grsRes = await apiService.networks.getGroups(networkId);
        grsData = grsRes.data?.data || grsRes.data || [];
        // Debug des groupes - Supprimé pour la production
      } catch (error) {
        // Erreur lors du chargement des groupes - Supprimé pour la production
      }

      try {
        const membersRes = await apiService.networks.getMembers(networkId);
        membersData = membersRes.data?.data || membersRes.data || [];
        // Debug des membres - Supprimé pour la production
      } catch (error) {
        // Erreur lors du chargement des membres - Supprimé pour la production
      }

      // Charger les utilisateurs disponibles seulement si on a un filtre d'église valide
      if (Object.keys(churchFilter).length > 0) {
        try {
          // Debug du chargement des utilisateurs - Supprimé pour la production
          const availableUsersRes = await apiService.users.getAvailable(churchFilter);
          availableUsersData = availableUsersRes.data?.data || availableUsersRes.data || [];
          // Debug des utilisateurs disponibles - Supprimé pour la production
        } catch (error) {
          // Erreur lors du chargement des utilisateurs disponibles - Supprimé pour la production
        }
      } else {
        // Pas de filtre d'église, utilisateurs disponibles non chargés
      }

      setNetworkData({
        reseau: reseauData,
        stats: statsData,
        grs: Array.isArray(grsData) ? grsData : [],
        members: Array.isArray(membersData) ? membersData : [],
        available_users: Array.isArray(availableUsersData) ? availableUsersData : []
      });
    } catch (err) {
      const processedError = handleApiError(err, 'erreur fetchdata:');
      setError(processedError.message);
      // Erreur fetchData - Supprimé pour la production
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [networkId]);

  // Initialiser l'église locale par défaut pour les non-super-admin
  useEffect(() => {
    if ((user?.current_role || user?.role) !== 'SUPER_ADMIN') {
      let defaultChurchId = '';
      
      // Priorité 1: Église sélectionnée dans le filtre global
      if (selectedChurch?.id || selectedChurch?._id) {
        defaultChurchId = selectedChurch.id || selectedChurch._id;
        // Debug de l'église sélectionnée - Supprimé pour la production
      }
      // Priorité 2: Église de l'utilisateur connecté (fallback)
      else if (user?.eglise_locale) {
        defaultChurchId = typeof user.eglise_locale === 'object' 
          ? (user.eglise_locale.id || user.eglise_locale._id)
          : user.eglise_locale;
        // Debug de l'église utilisateur - Supprimé pour la production
      }
      
      if (defaultChurchId) {
        setMemberForm(prev => ({
          ...prev,
          eglise_locale: defaultChurchId
        }));
      }
    }
  }, [user, selectedChurch]);

  // Mettre à jour automatiquement le nom du groupe quand les responsables changent
  useEffect(() => {
    if (selectedResponsable1 || selectedResponsable2) {
      const generatedName = generateGroupName(selectedResponsable1, selectedResponsable2);
      setNewGroupName(generatedName);
    } else {
      setNewGroupName('');
    }
  }, [selectedResponsable1, selectedResponsable2, networkData.available_users]);

  // Fonction pour générer automatiquement le nom du groupe
  const generateGroupName = (responsable1, responsable2) => {
    if (!responsable1) return '';
    
    // Trouver les utilisateurs sélectionnés
    const user1 = networkData.available_users.find(u => (u.id || u._id) === responsable1);
    const user2 = networkData.available_users.find(u => (u.id || u._id) === responsable2);
    
    let responsableName = '';
    if (user1) {
      // Utiliser la logique de formatage seulement pour username
      if (user1.username) {
        responsableName = formatResponsableName(user1.username);
      } else {
        // Si pas de username, utiliser pseudo tel quel
        responsableName = user1.pseudo || '';
      }
    } else if (user2) {
      if (user2.username) {
        responsableName = formatResponsableName(user2.username);
      } else {
        responsableName = user2.pseudo || '';
      }
    }
    
    if (!responsableName) return '';
    
    // Nettoyer le nom (enlever les espaces, caractères spéciaux)
    const cleanName = responsableName
      .replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '') // Garder lettres, chiffres et espaces
      .replace(/\s+/g, '_') // Remplacer espaces par underscores
      .trim();
    
    return `GR_${cleanName}`;
  };

  // Gestionnaires d'événements pour prévisionnels
  const handleSavePrevisionnel = async (previsionnelData) => {
    setPrevisionnelLoading(true);
    try {
      await previsionnelService.create(previsionnelData);
      
      setSnackbar({ 
        open: true, 
        message: i18nService.t('previsionnel.success.created'), 
        severity: 'success' 
      });
      
      setPrevisionnelModal(false);
      
      // Optionnel : rafraîchir les données du réseau
      await fetchData();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || i18nService.t('errors.api.operation');
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    } finally {
      setPrevisionnelLoading(false);
    }
  };

  const handlePrevisionnelSuccess = () => {
    setSnackbar({
      open: true,
      message: i18nService.t('previsionnel.success.created'),
      severity: 'success'
    });
    // Recharger les données si nécessaire
  };

  const handleSaveAssistance = async (assistanceData) => {
    setAssistanceLoading(true);
    try {
      await assistanceService.create(assistanceData);
      
      setSnackbar({ 
        open: true, 
        message: i18nService.t('assistance.success.created'), 
        severity: 'success' 
      });
      
      setAssistanceModal(false);
      
      // Optionnel : rafraîchir les données du réseau
      await fetchData();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || i18nService.t('errors.api.operation');
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    } finally {
      setAssistanceLoading(false);
    }
  };

  const handleAssistanceSuccess = () => {
    setSnackbar({
      open: true,
      message: i18nService.t('assistance.success.created'),
      severity: 'success'
    });
    // Recharger les données si nécessaire
  };

  // Gestionnaires pour l'historique et l'édition


  const handlePrevisionnelModalClose = () => {
    setPrevisionnelModal(false);
  };

  const handleAssistanceModalClose = () => {
    setAssistanceModal(false);
  };

  // Gestionnaires d'événements
      const handleEditGr = async (data) => {
      try {
        // Debug des données - Supprimé pour la production
        
        const groupId = data.id || data._id;
        if (!groupId) {
          setSnackbar({ open: true, message: i18nService.t('networks.details.invalidGroupId'), severity: 'error' });
          return;
        }
        
        // Debug de la modification - Supprimé pour la production
      
      await apiService.groups.update(groupId, data);
      setEditGrModal(false);
      setSelectedGr(null);
      setSnackbar({ open: true, message: i18nService.t('success.groupUpdated'), severity: 'success' });
      // Refresh données réseau
              await fetchData();
      } catch (error) {
        // Erreur lors de la modification - Supprimé pour la production
        setSnackbar({ open: true, message: i18nService.t('errors.api.updateGroup'), severity: 'error' });
      }
  };

  // Gestion du dialogue de suppression de GR
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [grToDelete, setGrToDelete] = useState(null);

  const handleDeleteGr = (grId) => {
    setGrToDelete(grId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteGr = async () => {
    try {
      await apiService.groups.delete(grToDelete);
      await fetchData();
      setSnackbar({ open: true, message: i18nService.t('success.groupDeleted'), severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: i18nService.t('errors.api.deleteGroup'), severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setGrToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setGrToDelete(null);
  };

      const handleAddGr = async (data) => {
      try {
        // Debug des données - Supprimé pour la production
      
      // Le nom du groupe sera généré automatiquement par le backend
      const payload = {
        ...data,
        network_id: networkId,
        responsable1_id: selectedResponsable1,
        qualification: selectedQualification,
        superieur_hierarchique_id: selectedSuperieurHierarchique || null
      };
      if (selectedResponsable2) {
        payload.responsable2_id = selectedResponsable2;
      }
      
              // Debug du payload - Supprimé pour la production
      
      await apiService.groups.create(payload);
      setAddGrModal(false);
      setSnackbar({ open: true, message: i18nService.t('success.groupCreated'), severity: 'success' });
      // Refresh données réseau
      await fetchData();
      resetModalFields();
      } catch (error) {
        // Gestion intelligente des erreurs
        if (error.response?.status === 401) {
          const errorMessage = error.response?.data?.message || '';
          
          if (errorMessage.includes('droits') || 
              errorMessage.includes('autorisé') || 
              errorMessage.includes('église')) {
            // Erreur de permissions
            setSnackbar({ 
              open: true, 
              message: i18nService.t('errors.permissions.insufficient'), 
              severity: 'warning' 
            });
          } else if (errorMessage.includes('token') || 
                     errorMessage.includes('expiré') || 
                     errorMessage.includes('Non autorisé')) {
            // Erreur d'authentification réelle
            setSnackbar({ 
              open: true, 
              message: i18nService.t('errors.session.expired'), 
              severity: 'warning' 
            });
            // La redirection sera gérée automatiquement par l'intercepteur
          } else {
            // Autre erreur 401
            setSnackbar({ 
              open: true, 
              message: errorMessage || i18nService.t('errors.authorization'), 
              severity: 'warning' 
            });
          }
        } else if (error.response?.status === 403) {
          // Erreur de permissions
          setSnackbar({ 
            open: true, 
            message: error.response?.data?.message || i18nService.t('errors.accessDenied'), 
            severity: 'warning' 
          });
        } else {
          // Autres erreurs
          setSnackbar({ 
            open: true, 
            message: error.response?.data?.message || i18nService.t('errors.api.createGroup'), 
            severity: 'error' 
          });
        }
      }
  };

      const handleAddMember = async (data) => {
      try {
        // Debug des données - Supprimé pour la production
        
        // Vérifier que selectedGr est défini
        if (!selectedGr) {
          setSnackbar({ open: true, message: i18nService.t('networks.details.noGroupSelected'), severity: 'error' });
          return;
        }
        
        const groupId = selectedGr.id || selectedGr._id;
        if (!groupId) {
          setSnackbar({ open: true, message: i18nService.t('networks.details.invalidGroupId'), severity: 'error' });
          return;
        }
        
        // Debug du groupId - Supprimé pour la production
        
      if (newMemberMode) {
        // Debug du mode création - Supprimé pour la production
        let imageUrl = data.image || '';
        
        // L'upload d'image se fera après la création de l'utilisateur
        
        const newMemberData = {
          ...data,
          password: data.password || i18nService.t('auth.register.defaultPassword'),
          role: 'MEMBRE', // Use PostgreSQL enum
          image: imageUrl,
        };
        
        // For non-super-admin, automatically set local church
        if ((user?.current_role || user?.role) !== 'SUPER_ADMIN') {
          let defaultChurchId = '';
          
          // Priorité 1: Église sélectionnée dans le filtre global
          if (selectedChurch?.id || selectedChurch?._id) {
            defaultChurchId = selectedChurch.id || selectedChurch._id;
            // Debug de l'église sélectionnée - Supprimé pour la production
          }
          // Priorité 2: Église de l'utilisateur connecté (fallback)
          else if (user?.eglise_locale) {
            defaultChurchId = typeof user.eglise_locale === 'object' 
              ? (user.eglise_locale.id || user.eglise_locale._id)
              : user.eglise_locale;
            // Debug de l'église utilisateur - Supprimé pour la production
          }
          
          if (defaultChurchId) {
            newMemberData.eglise_locale_id = defaultChurchId;
          }
        }
        
        // Mapper les départements si sélectionnés
        if (data.departement_ids && data.departement_ids.length > 0) {
          newMemberData.departement_ids = data.departement_ids;
        }
        
        // {i18nService.t('common.actions.delete')} les champs qui ne sont pas dans le modèle Prisma
        delete newMemberData.eglise_locale;
        delete newMemberData.departement;
        
        // Remplacer les chaînes vides par null pour les champs optionnels
        Object.keys(newMemberData).forEach(key => {
          if (newMemberData[key] === '') {
            newMemberData[key] = null;
          }
        });
        
        // Debug des données utilisateur - Supprimé pour la production
        
        const userRes = await apiService.users.create(newMemberData);
        const newUserId = userRes.data?.data?.id || userRes.data?.data?._id || userRes.data?.id || userRes.data?._id;
        // Debug de l'ID utilisateur - Supprimé pour la production
        
        // Upload de l'image si une image est sélectionnée
        if (selectedImage) {
          try {
            const formData = new FormData();
            formData.append('image', selectedImage);
            
            const response = await apiService.users.uploadUserImage(newUserId, formData);
            const uploadedImageUrl = response.data?.data?.image || response.data?.image;
            
            if (uploadedImageUrl) {
              // Mettre à jour l'utilisateur avec l'URL de l'image uploadée
              await apiService.users.update(newUserId, { image: uploadedImageUrl });
            }
          } catch (error) {
            logger.warn('Erreur lors de l\'upload de l\'image:', error);
            // On continue même si l'upload d'image échoue
          }
        }
        
        // 2. Ajouter ce nouvel utilisateur au groupe
        await apiService.groups.addMember(groupId, newUserId);
        // Debug de l'ajout au groupe - Supprimé pour la production
        
              } else {
          // Mode sélection : ajouter un membre existant au groupe
          // Debug du mode sélection - Supprimé pour la production
          
          if (!data.user_id) {
            // Debug de l'erreur - Supprimé pour la production
            setSnackbar({ open: true, message: i18nService.t('networks.details.missingMemberId'), severity: 'error' });
            return;
          }
          
          // Debug de l'ajout - Supprimé pour la production
          await apiService.groups.addMember(groupId, data.user_id);
          // Debug de la confirmation - Supprimé pour la production
        }
      
      // Succès : fermer le modal et réinitialiser
      setAddMemberModal(false);
      setNewMemberMode(false);
      setSelectedMember(null);
              setMemberForm({
          username: '',
          pseudo: '',
          email: '',
          password: '',
          role: 'MEMBRE',
          genre: '',
          tranche_age: '',
          profession: '',
          ville_residence: '',
          origine: '',
          situation_matrimoniale: '',
          niveau_education: '',
          departement: '',
          departement_ids: [],
          qualification: '',
          telephone: '',
          adresse: '',
          image: ''
        });
      setSnackbar({ open: true, message: i18nService.t('success.memberAdded'), severity: 'success' });
      
              // Rafraîchir les données
        // Debug du rafraîchissement - Supprimé pour la production
        await fetchData();
        // Debug de la confirmation - Supprimé pour la production
        
      } catch (error) {
        // Erreur lors de l'ajout - Supprimé pour la production
        
        // Gestion des erreurs de manière plus intuitive
        let errorMessage = i18nService.t('errors.api.addMember');
        
        if (error.response?.status === 400) {
          // Erreur de validation côté serveur
          const serverMessage = error.response?.data?.message;
          if (serverMessage) {
            errorMessage = serverMessage;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else {
            errorMessage = i18nService.t('errors.validation.invalidData');
          }
        } else if (error.response?.status === 409) {
          // Conflit (utilisateur déjà existant)
          errorMessage = i18nService.t('errors.user.alreadyExists');
        } else if (error.response?.status === 401) {
          // Erreur d'authentification ou de permissions
          const serverMessage = error.response?.data?.message || '';
          
          if (serverMessage.includes('droits') || 
              serverMessage.includes('autorisé') || 
              serverMessage.includes('église')) {
            // Erreur de permissions
            errorMessage = i18nService.t('errors.permissions.addMember');
          } else if (serverMessage.includes('token') || 
                     serverMessage.includes('expiré') || 
                     serverMessage.includes('Non autorisé')) {
            // Erreur d'authentification réelle
            errorMessage = i18nService.t('errors.session.expired');
            // La redirection sera gérée automatiquement par l'intercepteur
          } else {
            // Autre erreur 401
            errorMessage = serverMessage || i18nService.t('errors.authorization');
          }
        } else if (error.response?.status === 403) {
          // Permissions insuffisantes
          errorMessage = i18nService.t('errors.permissions.addMember');
        } else if (error.response?.status === 500) {
          // Erreur serveur - afficher le vrai message d'erreur
          const serverError = error.response?.data?.error || error.response?.data?.message;
          if (serverError) {
            errorMessage = `Erreur serveur: ${serverError}`;
            // Debug de l'erreur serveur - Supprimé pour la production
          } else {
            errorMessage = i18nService.t('errors.server.internal');
            // Debug de l'erreur 500 - Supprimé pour la production
          }
        } else if (error.message && !error.message.includes('Request failed with status code')) {
          // Message d'erreur spécifique du code
          errorMessage = error.message;
        }
        
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleUpdateMember = async (data) => {
    try {
      // Debug des données - Supprimé pour la production
      // Gestion robuste de l'identifiant utilisateur
      const userId = selectedMember;
      if (!userId) {
        setSnackbar({ open: true, message: i18nService.t('networks.details.userIdNotFound'), severity: 'error' });
        return;
      }
      // Upload de l'image si une image est sélectionnée
      let imageUrl = data.image || '';
      if (editSelectedImage) {
        try {
          const formData = new FormData();
          formData.append('image', editSelectedImage);
          
          const response = await apiService.users.uploadUserImage(userId, formData);
          
          imageUrl = response.data?.data?.image || response.data?.image;
          
          if (!imageUrl) {
            throw new Error('URL de l\'image non reçue');
          }
        } catch (error) {
          toast.error(i18nService.t('errors.imageUploadFailed'));
          return;
        }
      }
      
      // On ne garde que les champs non vides (sauf l'id)
      const filteredData = Object.keys(data).reduce((obj, key) => {
        if ((key === 'user_id' || key === '_id' || key === 'id') || (data[key] !== '' && data[key] !== undefined && data[key] !== null)) {
          obj[key] = data[key];
        }
        return obj;
      }, {});
      
      // Ajouter l'URL de l'image si elle a été uploadée
      if (imageUrl) {
        filteredData.image = imageUrl;
      }
      
      await apiService.users.update(userId, filteredData);
      setEditMemberModal(false);
      setEditMemberForm({
        username: '',
        pseudo: '',
        email: '',
        password: '',
        genre: '',
        tranche_age: '',
        profession: '',
        ville_residence: '',
        origine: '',
        situation_matrimoniale: '',
        niveau_education: '',
        departement: '',
        departement_ids: [],
        qualification: '',
        telephone: '',
        adresse: '',
        image: ''
      });
      setSnackbar({ open: true, message: i18nService.t('success.memberUpdated'), severity: 'success' });
      // Refresh données réseau
              await fetchData();
      } catch (error) {
        // Erreur lors de la mise à jour - Supprimé pour la production
        
        // Gestion des erreurs de manière plus intuitive
      let errorMessage = i18nService.t('errors.api.updateMember');
      
      if (error.response?.status === 400) {
        const serverMessage = error.response?.data?.message;
        if (serverMessage) {
          errorMessage = serverMessage;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = i18nService.t('errors.validation.invalidData');
        }
      } else if (error.response?.status === 404) {
        errorMessage = i18nService.t('errors.member.notFound');
      } else if (error.response?.status === 403) {
        errorMessage = i18nService.t('errors.permissions.updateMember');
      } else if (error.response?.status === 500) {
        // Erreur serveur - afficher le vrai message d'erreur
        const serverError = error.response?.data?.error || error.response?.data?.message;
        if (serverError) {
          errorMessage = `Erreur serveur: ${serverError}`;
        } else {
          errorMessage = i18nService.t('errors.server.internal');
        }
      } else if (error.message && !error.message.includes('Request failed with status code')) {
        errorMessage = error.message;
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };



  const [deleteMemberDialogOpen, setDeleteMemberDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState({ grId: null, userId: null });

  // Mettre à jour les supérieurs disponibles quand la qualification change
  useEffect(() => {
    if (selectedQualification && networkData) {
      const superieurs = calculateAvailableSuperieurs(selectedQualification);
      setAvailableSuperieurs(superieurs);
      
      // Réinitialiser la sélection si le supérieur actuel n'est plus disponible
      if (selectedSuperieurHierarchique) {
        const isStillAvailable = superieurs.some(s => s.id === selectedSuperieurHierarchique);
        if (!isStillAvailable) {
          setSelectedSuperieurHierarchique('');
        }
      }
    } else {
      setAvailableSuperieurs([]);
      setSelectedSuperieurHierarchique('');
    }
  }, [selectedQualification, networkData]);

  const handleRemoveMember = (grId, userId) => {
    setMemberToDelete({ grId, userId });
    setDeleteMemberDialogOpen(true);
  };

  const handleConfirmDeleteMember = async () => {
    const { grId, userId } = memberToDelete;
    try {
      await apiService.groups.removeMember(grId, userId);
      setSnackbar({ open: true, message: i18nService.t('success.memberDeleted'), severity: 'success' });
              await fetchData();
      } catch (error) {
        // Erreur lors de la suppression - Supprimé pour la production
        
        // Gestion des erreurs de manière plus intuitive
      let errorMessage = i18nService.t('errors.api.deleteMember');
      
      if (error.response?.status === 400) {
        const serverMessage = error.response?.data?.message;
        if (serverMessage) {
          errorMessage = serverMessage;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = i18nService.t('errors.member.cannotDelete');
        }
      } else if (error.response?.status === 404) {
        errorMessage = i18nService.t('errors.memberOrGroup.notFound');
      } else if (error.response?.status === 403) {
        errorMessage = i18nService.t('errors.permissions.deleteMember');
      } else if (error.response?.status === 500) {
        // Erreur serveur - afficher le vrai message d'erreur
        const serverError = error.response?.data?.error || error.response?.data?.message;
        if (serverError) {
          errorMessage = `Erreur serveur: ${serverError}`;
        } else {
          errorMessage = i18nService.t('errors.server.internal');
        }
      } else if (error.message && !error.message.includes('Request failed with status code')) {
        errorMessage = error.message;
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setDeleteMemberDialogOpen(false);
      setMemberToDelete({ grId: null, userId: null });
    }
  };

  const handleCloseDeleteMemberDialog = () => {
    setDeleteMemberDialogOpen(false);
    setMemberToDelete({ grId: null, userId: null });
  };

  if (loading) return <Loading titre={i18nService.t('networks.details.loading')} />;
  if (error) return <SecureErrorMessage error={error} title={i18nService.t('errors.loading')} />;

  // Vérification de l'authentification
  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="error">
          {i18nService.t('auth.loginRequired')}
        </Typography>
      </Box>
    );
  }

  return (
    <AccessControl allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'COLLECTEUR_RESEAUX']}>
      <Box sx={{ 
        minHeight: '100vh'
      }}>
        <Navbar />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #662d91, #9e005d, #9e005d)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
                mb: 1
              }}
            >
              {i18nService.t('networks.details.title')}
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {networkData.reseau.nom}
            </Typography>
          </Box>
          <Tooltip title={i18nService.t('common.actions.refresh')}>
            <IconButton 
              onClick={fetchData} 
              sx={{ 
                background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(102, 45, 145, 0.25)',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #1b1464, #662d91)',
                  boxShadow: '0 8px 20px rgba(102, 45, 145, 0.35)',
                  transform: 'scale(1.1) rotate(180deg)'
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        {/* Section Responsables */}
        <Paper 
          data-aos="fade-up" 
          sx={{ 
            p: 4, 
            mb: 4,
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(102, 45, 145, 0.1)',
            boxShadow: '0 4px 20px rgba(102, 45, 145, 0.08)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'primary.main'
              }}
            >
              {i18nService.t('networks.details.networkResponsibles')}
            </Typography>
            {(permissions.isAdmin || permissions.isSuperAdmin || permissions.isCollecteurReseaux || permissions.isManager) && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AssessmentIcon />}
                  onClick={() => setPrevisionnelModal(true)}
                  sx={{ 
                    backgroundColor: '#2E7D32',
                    '&:hover': { backgroundColor: '#1B5E20' }
                  }}
                >
                  {i18nService.t('previsionnel.button.create')}
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<PeopleIcon />}
                  onClick={() => setAssistanceModal(true)}
                  sx={{ 
                    backgroundColor: '#1976d2',
                    '&:hover': { backgroundColor: '#1565c0' }
                  }}
                >
                  {i18nService.t('assistance.form.save')}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  onClick={() => setHistoriqueModal(true)}
                  sx={{ 
                    borderColor: '#FF9800',
                    color: '#FF9800',
                    '&:hover': { 
                      borderColor: '#F57C00',
                      backgroundColor: '#FFF3E0'
                    }
                  }}
                >
                    {i18nService.t('common.history')}
                </Button>
              </Box>
            )}
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon />
                <Box>
                  <Typography variant="subtitle2">{i18nService.t('networks.details.responsable1')}</Typography>
                  <Typography>{networkData.reseau.responsable1?.username}</Typography>
                </Box>
              </Box>
            </Grid>
            {networkData.reseau.responsable2?.username && (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PersonIcon />
                  <Box>
                    <Typography variant="subtitle2">{i18nService.t('networks.details.responsable2')}</Typography>
                    <Typography>{networkData.reseau.responsable2?.username}</Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Section Statistiques */}
        <Paper 
          data-aos="fade-up" 
          sx={{ 
            p: 4, 
            mb: 4,
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(102, 45, 145, 0.1)',
            boxShadow: '0 4px 20px rgba(102, 45, 145, 0.08)'
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              mb: 3
            }}
          >
            {i18nService.t('networks.details.statistics')}
          </Typography>
          <Grid container spacing={2}>
            {getNetworkStatsConfig(networkData.stats || {}).map((stat, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <StatCard>
                  <Typography variant="body2" sx={{ mb: 1 }}>{stat.label}</Typography>
                  <Typography variant="h4" color="primary">{stat.value}</Typography>
                </StatCard>
              </Grid>
            ))}
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <Typography variant="body2" sx={{ mb: 1 }}>{i18nService.t('networks.details.groupesReveil')}</Typography>
                <Typography variant="h4" color="primary">{networkData.grs.length}</Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <Typography variant="body2" sx={{ mb: 1 }}>{i18nService.t('networks.details.effectifTotal')}</Typography>
                <Typography variant="h4" color="primary">{(() => {
                  const membresSet = new Set();
                  
                  networkData.grs?.forEach((gr) => {
                    gr.members?.forEach((m) => {
                      const memberId = m?.id || m?._id || m?.user?.id || m?.user?._id;
                      if (memberId) {
                        membresSet.add(memberId);
                      }
                    });
                  });
                  
                  // Ajouter les responsables de réseau
                  const resp1Id = networkData.reseau?.responsable1?.id || networkData.reseau?.responsable1?._id;
                  const resp2Id = networkData.reseau?.responsable2?.id || networkData.reseau?.responsable2?._id;
                  
                  if (resp1Id) {
                    membresSet.add(resp1Id);
                  }
                  
                  if (resp2Id) {
                    membresSet.add(resp2Id);
                  }
                  
                  return membresSet.size;
                })()}</Typography>
              </StatCard>
            </Grid>
          </Grid>
        </Paper>

        {/* Section GR */}
        <Box data-aos="fade-up" sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">{i18nService.t('networks.details.groupesReveil')}</Typography>
            {(permissions.isAdmin || permissions.isSuperAdmin || permissions.isCollecteurReseaux) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setAddGrModal(true);
                  resetModalFields();
                }}
                disabled={!canCreateGroups}
                title={getHelpMessage(canCreateGroups)}
              >
                {i18nService.t('networks.details.addGR')}
              </Button>
            )}
          </Box>

          <Grid container sx={{ mx: 'auto' }} alignItems="stretch">
            {(Array.isArray(networkData.grs) ? networkData.grs : []).map((gr) => (
              <Grid data-aos="fade-up"sx={{
                width: '100%',
                padding: '10px 10px 10px 10px',
                '@media (min-width:500px) and (max-width:849px)': { width: '50%' },
                '@media (min-width:850px) and (max-width:1199px)': { width: '33.33%' },
                '@media (min-width:1200px) and (max-width:1599px)': { width: '25%' },
                '@media (min-width:1600px)': { width: '20%' },
                
                
              }} key={gr.id}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {gr.nom}
                      </Typography>
                      {(permissions.isAdmin || permissions.isSuperAdmin || permissions.isCollecteurReseaux) && (
                        <Box>
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setSelectedGr(gr);
                              setEditGrModal(true);
                            }}
                            disabled={!canUpdateGroups}
                            title={getHelpMessage(canUpdateGroups)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteGr(gr.id)}
                            disabled={!canDeleteGroups}
                            title={getHelpMessage(canDeleteGroups)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">{i18nService.t('networks.details.responsable1')}</Typography>
                      <Typography>{gr.responsable1?.username}</Typography>
                      {gr.responsable2?.username && (
                        <>
                          <Typography variant="subtitle2" sx={{ mt: 1 }}>{i18nService.t('networks.details.responsable2')}</Typography>
                          <Typography>{gr.responsable2?.username}</Typography>
                        </>
                      )}
                      <Typography sx={{ mt: 1 }}>
                        <strong>{i18nService.t('networks.details.nombreMembres')}</strong> {gr.members?.length}
                      </Typography>
                    </Box>
                    {gr.members?.map((member) => {
                      // Trouver les données complètes du membre dans networkData.members
                      const fullMemberData = networkData.members?.find(m => 
                        (m.user?.id || m.user?._id) === (member.user?.id || member.user?._id)
                      );
                      const memberData = fullMemberData?.user || member.user || {};
                      
                      return (
                        <Box
                          key={member.user?.id || member.user?._id || member._id || `member-${Math.random()}`}
                          sx={{
                            p: 1,
                            mb: 1,
                            borderRadius: 1,
                            bgcolor: 'background.default',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Typography>
                            {memberData.username || i18nService.t('common_text.unknownName')} (
                            <Typography 
                              component="span" 
                              variant="caption" 
                              sx={{ 
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                              }}
                            >
                              {formatQualificationWithFallback(memberData.qualification, i18nService.t('common.unknown'))}
                            </Typography>
                            )
                          </Typography>
                          {(permissions.isAdmin || permissions.isCollecteurReseaux || permissions.isSuperAdmin) && (
                            <Box>
                              <IconButton
                                size="small"
                                                                onClick={() => {
                                    // Debug de modification membre - Supprimé pour la production
                                    
                                    // Debug des données membre - Supprimé pour la production
                                  
                                  setSelectedMember(memberData.id || memberData._id);
                                  setEditMemberForm({
                                    username: memberData.username || '',
                                    pseudo: memberData.pseudo || '',
                                    genre: memberData.genre || '',
                                    tranche_age: memberData.tranche_age || '',
                                    profession: memberData.profession || '',
                                    ville_residence: memberData.ville_residence || '',
                                    origine: memberData.origine || '',
                                    situation_matrimoniale: memberData.situation_matrimoniale || '',
                                    niveau_education: memberData.niveau_education || '',
                                    departement: memberData.departement || '',
                                    departement_ids: memberData.user_departments?.map(ud => ud.department_id) || [],
                                    qualification: memberData.qualification || '',
                                    email: memberData.email || '',
                                    telephone: memberData.telephone || '',
                                    adresse: memberData.adresse || '',
                                    image: memberData.image || ''
                                  });
                                
                                                                  // Debug du formulaire - Supprimé pour la production
                                  
                                  // Vérifier l'état du formulaire après un délai
                                  setTimeout(() => {
                                    // Debug de l'état du formulaire - Supprimé pour la production
                                  }, 100);
                                
                                  setEditMemberModal(true);
                                }}
                                disabled={!canUpdateUsers}
                                title={getHelpMessage(canUpdateUsers)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveMember(gr.id, memberData.id || memberData._id)}
                                disabled={!canUpdateGroups}
                                title={getHelpMessage(canUpdateGroups)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </CardContent>
                  <CardActions sx={{ mt: 'auto', p: 2 }}>
                    {(permissions.isAdmin || permissions.isCollecteurReseaux || permissions.isSuperAdmin) && (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          setSelectedGr(gr);
                          setAddMemberModal(true);
                        }}
                        disabled={!canUpdateGroups}
                        title={getHelpMessage(canUpdateGroups)}
                      >
                        {i18nService.t('networks.details.addMember')}
                      </Button>
                    )}
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Modales */}
        <Dialog 
          open={addGrModal} 
          onClose={() => {
            setAddGrModal(false);
            resetModalFields();
          }}
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
            {i18nService.t('networks.details.addGroupDialog')}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ pt: 2 }}>
              <TextField
                select
                fullWidth
                id="network-details-responsable1"
                name="responsable1"
                label={i18nService.t('networks.details.responsable1')}
                sx={{ mb: 2 }}
                required
                value={selectedResponsable1 || ''}
                onChange={e => setSelectedResponsable1(e.target.value)}
                autoComplete="off"
              >
                {networkData.available_users.map((user) => (
                  <MenuItem key={user.id || user._id} value={user.id || user._id}>
                    {user.username}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                fullWidth
                id="network-details-responsable2"
                name="responsable2"
                label={i18nService.t('networks.details.responsable2Disabled')}
                sx={{ mb: 2 }}
                value={selectedResponsable2 || ''}
                onChange={e => setSelectedResponsable2(e.target.value)}
                disabled={true}
                InputProps={{
                  style: { 
                    backgroundColor: '#f5f5f5',
                    color: '#666'
                  }
                }}
                helperText={i18nService.t('common.actions.fieldTemporarilyDisabled')}
              >
                <MenuItem value="">{i18nService.t('common.actions.none')}</MenuItem>
                {networkData.available_users
                  .filter((user) => user._id !== selectedResponsable1)
                  .map((user) => (
                    <MenuItem key={user.id || user._id} value={user.id || user._id}>
                      {user.username}
                    </MenuItem>
                  ))}
              </TextField>

              <TextField
                select
                fullWidth
                id="network-details-qualification"
                name="qualification"
                label={i18nService.t('networks.details.responsibleQualification')}
                sx={{ mb: 2 }}
                required
                value={selectedQualification || ''}
                onChange={e => setSelectedQualification(e.target.value)}
                helperText={i18nService.t('networks.details.qualificationAutoAssigned')}
                autoComplete="off"
              >
                <MenuItem value="QUALIFICATION_12">12</MenuItem>
                <MenuItem value="QUALIFICATION_144">144</MenuItem>
                <MenuItem value="QUALIFICATION_1728">1728</MenuItem>
                <MenuItem value="QUALIFICATION_20738">20738</MenuItem>
                <MenuItem value="QUALIFICATION_248832">248832</MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                id="network-details-superior"
                name="superior"
                required
                label={i18nService.t('networks.details.superior')}
                sx={{ mb: 2 }}
                value={selectedSuperieurHierarchique || ''}
                onChange={e => setSelectedSuperieurHierarchique(e.target.value)}
                helperText={
                  selectedQualification 
                    ? i18nService.t('networks.details.selectSuperiorBasedOnQualification', { 
                        qualification: selectedQualification.replace('QUALIFICATION_', ''),
                        count: availableSuperieurs.length,
                        plural: availableSuperieurs.length > 1 ? 's' : ''
                      })
                    : i18nService.t('networks.details.selectQualificationFirst')
                }
                disabled={!selectedQualification}
                autoComplete="off"
              >
               
                {availableSuperieurs.map((superieur) => (
                  <MenuItem key={superieur.id} value={superieur.id}>
                    {superieur.label}
                  </MenuItem>
                ))}
                {availableSuperieurs.length === 0 && selectedQualification && (
                  <MenuItem disabled>
                    {i18nService.t('networks.details.noAvailableSuperiors')}
                  </MenuItem>
                )}
              </TextField>

              <TextField
                fullWidth
                id="network-details-group-name"
                name="groupName"
                label={i18nService.t('networks.details.nomGroupe')}
                sx={{ mb: 2 }}
                value={newGroupName || ''}
                InputProps={{
                  readOnly: true,
                }}
                placeholder={i18nService.t('networks.details.nameAutoGenerated')}
                helperText={i18nService.t('networks.details.nameGeneratedFromResponsible')}
                autoComplete="off"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setAddGrModal(false);
              resetModalFields();
            }}>{i18nService.t('networks.details.cancel')}</Button>
            <Button 
              variant="contained" 
              onClick={() => handleAddGr({
                responsable1: selectedResponsable1,
                responsable2: selectedResponsable2,
                qualification: selectedQualification,
                superieur_hierarchique: selectedSuperieurHierarchique
              })}
              disabled={!canCreateGroups || !selectedResponsable1 || !selectedQualification || !selectedSuperieurHierarchique}
              title={getHelpMessage(canCreateGroups)}
            >
              {i18nService.t('common.actions.add')}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={addMemberModal}
          onClose={() => {
            setAddMemberModal(false);
            setNewMemberMode(false);
            setSertDepartement(false);
            setMemberForm({
              username: '',
              pseudo: '',
              email: '',
              password: '',
              role: 'MEMBRE',
              genre: '',
              tranche_age: '',
              profession: '',
              ville_residence: '',
              origine: '',
              situation_matrimoniale: '',
              niveau_education: '',
              departement: '',
              departement_ids: [],
              qualification: '',
              telephone: '',
              adresse: '',
              image: ''
            });
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {i18nService.t('networks.details.addMember')}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, mb: 2 }}>
              <Button
                variant={!newMemberMode ? "contained" : "outlined"}
                onClick={() => setNewMemberMode(false)}
                sx={{ mr: 1 }}
                disabled={!canUpdateGroups}
                title={getHelpMessage(canCreateGroups)}
              >
                {i18nService.t('networks.details.selectExistingMember')}
              </Button>
              <Button
                variant={newMemberMode ? "contained" : "outlined"}
                onClick={() => setNewMemberMode(true)}
                disabled={!canUpdateGroups}
                title={getHelpMessage(canCreateGroups)}
              >
                {i18nService.t('networks.details.createNewMember')}
              </Button>
            </Box>

            <Box component="form" sx={{ pt: 2 }}>
              {!newMemberMode ? (
                <TextField
                  select
                  fullWidth
                  id="network-details-select-member"
                  name="selectedMember"
                  label={i18nService.t('networks.details.selectMember')}
                  value={selectedMember || ''}
                                      onChange={(e) => {
                      // Debug du champ sélection - Supprimé pour la production
                      setSelectedMember(e.target.value);
                      // Debug de la mise à jour - Supprimé pour la production
                    }}
                  required
                  disabled={!canUpdateGroups}
                  title={getHelpMessage(canCreateGroups)}
                  autoComplete="off"
                >
                  {networkData.available_users.filter(user => ![i18nService.t('qualifications.governance'), i18nService.t('qualifications.networkResponsible'), i18nService.t('qualifications.ecodim'), i18nService.t('qualifications.ecodimResponsible')].includes(user.qualification)).map((user) => (
                    <MenuItem key={user.id || user._id} value={user.id || user._id}>
                      {user.username} (
                      <Typography 
                        component="span" 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                      >
                        {formatQualificationWithFallback(user.qualification)}
                      </Typography>
                      )
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <>
                  {/* Section Photo de profil - Centrée et stylée */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    mb: 3,
                    p: 2,
                    border: '2px dashed var(--upload-dashed)',
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#1976d2',
                      backgroundColor: '#f5f5f5'
                    }
                  }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        mb: 1.5, 
                        color: 'primary.main',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    >
                      {i18nService.t('auth.register.profileImage')}
                    </Typography>
                    
                    {/* Aperçu de l'image - Centré */}
                    {(memberForm.image || imagePreview) ? (
                      <Box sx={{ 
                        position: 'relative',
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        mb: 1.5 
                      }}>
                        <img
                          src={imagePreview || getImageUrl(memberForm.image)}
                          alt="Aperçu de la photo de profil"
                          style={{
                            width: 90,
                            height: 90,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid var(--white-border)',
                            boxShadow: '0 2px 8px var(--network-shadow)',
                            marginBottom: 12
                          }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={handleRemoveImage}
                          disabled={!canUpdateGroups}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            left: -8,
                            bgcolor: 'white',
                            border: '2px solid',
                            borderColor: 'error.main',
                            '&:hover': {
                              bgcolor: 'error.light',
                              color: 'white'
                            }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 1.5
                      }}>
                        <Box sx={{
                          width: 90,
                          height: 90,
                          borderRadius: '50%',
                          backgroundColor: '#e0e0e0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 1,
                          border: '2px dashed #bdbdbd'
                        }}>
                          <PersonIcon sx={{ fontSize: 32, color: '#9e9e9e' }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
                          Aucune photo sélectionnée
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Bouton d'upload - Centré */}
                    <Button
                      variant="contained"
                      component="label"
                      disabled={!canUpdateGroups}
                      size="small"
                      sx={{ 
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        px: 2,
                        py: 1,
                        fontSize: '0.875rem',
                        boxShadow: '0 2px 6px var(--network-blue-shadow)',
                        '&:hover': {
                          boxShadow: '0 3px 8px var(--network-blue-hover-shadow)',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      {memberForm.image || imagePreview 
                        ? i18nService.t('auth.register.changeImage') 
                        : i18nService.t('auth.register.selectImage')
                      }
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </Button>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center', fontSize: '0.7rem' }}>
                      JPG, PNG, GIF (max 5MB)
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    id="network-details-member-username"
                    name="username"
                    label={i18nService.t('auth.register.username')}
                    value={memberForm.username}
                    onChange={(e) => setMemberForm({ ...memberForm, username: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                    disabled={!canUpdateGroups}
                    title={getHelpMessage(canCreateGroups)}
                    autoComplete="username"
                  />
                  <TextField
                    fullWidth
                    id="network-details-member-pseudo"
                    name="pseudo"
                    label={i18nService.t('auth.register.pseudo')}
                    value={memberForm.pseudo}
                    onChange={(e) => setMemberForm({ ...memberForm, pseudo: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                    disabled={!canUpdateGroups}
                    title={getHelpMessage(canCreateGroups)}
                    autoComplete="nickname"
                  />
                  <TextField
                    fullWidth
                    id="network-details-member-email"
                    name="email"
                    label={i18nService.t('auth.register.email')}
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                    disabled={!canUpdateGroups}
                    title={getHelpMessage(canCreateGroups)}
                    autoComplete="email"
                  />
                  <TextField
                    fullWidth
                    id="network-details-member-telephone"
                    name="telephone"
                    label={i18nService.t('auth.register.telephone')}
                    value={memberForm.telephone}
                    onChange={(e) => setMemberForm({ ...memberForm, telephone: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                    disabled={!canUpdateGroups}
                    title={getHelpMessage(canCreateGroups)}
                    autoComplete="tel"
                  />
                  <TextField
                    fullWidth
                    id="network-details-member-adresse"
                    name="adresse"
                    label={i18nService.t('auth.register.adresse')}
                    value={memberForm.adresse}
                    onChange={(e) => setMemberForm({ ...memberForm, adresse: e.target.value })}
                    sx={{ mb: 2 }}
                    disabled={!canUpdateGroups}
                    title={getHelpMessage(canCreateGroups)}
                    autoComplete="street-address"
                  />

                  <TextField
                    select
                    fullWidth
                    id="network-details-member-genre"
                    name="genre"
                    label={i18nService.t('auth.register.genre')}
                    value={memberForm.genre}
                    onChange={(e) => setMemberForm({ ...memberForm, genre: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                    disabled={!canUpdateGroups}
                    title={getHelpMessage(canCreateGroups)}
                    autoComplete="sex"
                  >
                    {GENRE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    id="network-details-member-tranche-age"
                    name="tranche_age"
                    label={i18nService.t('auth.register.ageRange')}
                    value={memberForm.tranche_age}
                    onChange={(e) => setMemberForm({ ...memberForm, tranche_age: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                    disabled={!canUpdateGroups}
                    title={getHelpMessage(canCreateGroups)}
                    autoComplete="bday"
                  >
                    {TRANCHE_AGE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    id="network-details-member-profession"
                    name="profession"
                    label={i18nService.t('auth.register.profession')}
                    value={memberForm.profession}
                    onChange={(e) => setMemberForm({ ...memberForm, profession: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                    disabled={!canUpdateGroups}
                    title={getHelpMessage(canCreateGroups)}
                    autoComplete="organization-title"
                  />
                  <TextField
                    fullWidth
                    id="network-details-member-ville-residence"
                    name="ville_residence"
                    label={i18nService.t('auth.register.villeResidence')}
                    value={memberForm.ville_residence}
                    onChange={(e) => setMemberForm({ ...memberForm, ville_residence: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                    disabled={!canUpdateGroups}
                    title={getHelpMessage(canCreateGroups)}
                    autoComplete="address-level2"
                  />
                  <TextField
                    select
                    fullWidth
                    id="network-details-member-origine"
                    name="origine"
                    label={i18nService.t('auth.register.originCountry')}
                    value={memberForm.origine}
                    onChange={(e) => setMemberForm({ ...memberForm, origine: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                    disabled={!canUpdateGroups}
                    title={getHelpMessage(canCreateGroups)}
                    autoComplete="country"
                  >
                    {COUNTRIES.map((country) => (
                      <MenuItem key={country.value} value={country.value}>{country.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    id="network-details-member-situation-matrimoniale"
                    name="situation_matrimoniale"
                    label={i18nService.t('auth.register.situationMatrimoniale')}
                    value={memberForm.situation_matrimoniale}
                    onChange={(e) => setMemberForm({ ...memberForm, situation_matrimoniale: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                    disabled={!canUpdateGroups}
                    title={getHelpMessage(canCreateGroups)}
                    autoComplete="off"
                  >
                    {SITUATION_MATRIMONIALE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    id="network-details-member-niveau-education"
                    name="niveau_education"
                    label={i18nService.t('auth.register.educationLevel')}
                    value={memberForm.niveau_education}
                    onChange={(e) => setMemberForm({ ...memberForm, niveau_education: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                    disabled={!canUpdateGroups}
                    title={getHelpMessage(canCreateGroups)}
                    autoComplete="off"
                  >
                    {NIVEAU_EDUCATION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    id="network-details-member-qualification"
                    name="qualification"
                    label={i18nService.t('auth.register.qualification')}
                    value={memberForm.qualification}
                    onChange={(e) => setMemberForm({ ...memberForm, qualification: e.target.value })}
                    required
                    disabled={!canUpdateGroups}
                    title={getHelpMessage(canCreateGroups)}
                    autoComplete="off"
                  >
                    {QUALIFICATION_OPTIONS.filter(qual => ![i18nService.t('qualifications.governance'), i18nService.t('qualifications.networkResponsible'), i18nService.t('qualifications.ecodim'), i18nService.t('qualifications.ecodimResponsible')].includes(qual.value)).map((qual) => (
                      <MenuItem key={qual.value} value={qual.value}>{qual.label}</MenuItem>
                    ))}
                  </TextField>
                  <FormControlLabel
                    control={
                      <Switch
                        id="network-details-member-sert-departement"
                        name="sert_departement"
                        checked={sertDepartement}
                        onChange={(e) => setSertDepartement(e.target.checked)}
                        disabled={!canUpdateGroups}
                        title={getHelpMessage(canCreateGroups)}
                      />
                    }
                    label={i18nService.t('networks.details.sertDepartement')}
                    sx={{ mb: 2 }}
                  />
                  {sertDepartement && (
                    <FormControl fullWidth sx={{ mb: 2 }} disabled={!canUpdateGroups}>
                      <InputLabel id="network-details-member-departments-label">{i18nService.t('auth.register.departments')}</InputLabel>
                      <Select
                        id="network-details-member-departments"
                        name="departement_ids"
                        multiple
                        value={memberForm.departement_ids || []}
                        onChange={(e) => setMemberForm({ ...memberForm, departement_ids: e.target.value })}
                        labelId="network-details-member-departments-label"
                        autoComplete="off"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const dept = departments.find(d => (d.id || d._id) === value);
                              return (
                                <Chip 
                                  key={value} 
                                  label={dept ? dept.nom : value} 
                                  size="small"
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept.id || dept._id} value={dept.id || dept._id}>
                            {dept.nom}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                // Définir l'église locale par défaut pour les non-super-admin
                let defaultEgliseLocale = '';
                if ((user?.current_role || user?.role) !== 'SUPER_ADMIN') {
                  // Priorité 1: Église sélectionnée dans le filtre global
                  if (selectedChurch?.id || selectedChurch?._id) {
                    defaultEgliseLocale = selectedChurch.id || selectedChurch._id;
                  }
                  // Priorité 2: Église de l'utilisateur connecté (fallback)
                  else if (user?.eglise_locale) {
                    defaultEgliseLocale = typeof user.eglise_locale === 'object' 
                      ? (user.eglise_locale.id || user.eglise_locale._id)
                      : user.eglise_locale;
                  }
                }
                
                setAddMemberModal(false);
                setNewMemberMode(false);
                setMemberForm({
                  username: '',
                  pseudo: '',
                  email: '',
                  password: '',
                  role: 'MEMBRE',
                  genre: '',
                  tranche_age: '',
                  profession: '',
                  ville_residence: '',
                  origine: '',
                  situation_matrimoniale: '',
                  niveau_education: '',
                  eglise_locale: defaultEgliseLocale,
                  departement: '',
                  departement_ids: [],
                  qualification: '',
                  telephone: '',
                  adresse: '',
                  image: ''
                });
              }}
            >
              {i18nService.t('networks.details.cancel')}
            </Button>
            <Button
              variant="contained"
                              onClick={(e) => {
                  // Debug du bouton - Supprimé pour la production
                  
                  if (newMemberMode) {
                    // Mode création : passer le formulaire complet
                    // Debug du mode création - Supprimé pour la production
                    handleAddMember(memberForm);
                  } else {
                    // Mode sélection : passer l'ID du membre sélectionné
                    // Debug du mode sélection - Supprimé pour la production
                    if (!selectedMember) {
                      // Debug de l'erreur - Supprimé pour la production
                      setSnackbar({ open: true, message: i18nService.t('networks.details.selectMember'), severity: 'error' });
                      return;
                    }
                    // Debug de l'envoi - Supprimé pour la production
                    handleAddMember({ user_id: selectedMember });
                  }
                }}
              disabled={
                !canUpdateGroups ||
                (newMemberMode ? !memberForm.username || !memberForm.email || !memberForm.qualification : !selectedMember)
              }
              title={getHelpMessage(canCreateGroups)}
            >
              {i18nService.t('networks.details.addMember')}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog 
          open={editGrModal} 
          onClose={() => setEditGrModal(false)}
          PaperProps={{
            sx: {
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(102, 45, 145, 0.15)',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(102, 45, 145, 0.1)'
            }
          }}
          onEnter={async () => {
            if (selectedGr) {
              try {
                const groupId = selectedGr.id || selectedGr._id;
                                  if (!groupId) {
                    // Debug de l'erreur - Supprimé pour la production
                    setSnackbar({ open: true, message: i18nService.t('networks.details.invalidGroupId'), severity: 'error' });
                    return;
                  }
                
                const res = await apiService.groups.getById(groupId);
                                  const group = res.data?.data || res.data || {};
                  // Debug du groupe récupéré - Supprimé pour la production
                
                setSelectedResponsable1(
                  group.responsable1
                    ? (typeof group.responsable1 === 'object' ? group.responsable1.id || group.responsable1._id : group.responsable1)
                    : ''
                );
                setSelectedResponsable2(
                  group.responsable2
                    ? (typeof group.responsable2 === 'object' ? group.responsable2.id || group.responsable2._id : group.responsable2)
                    : ''
                );
                              } catch (e) {
                  // Erreur lors de la récupération - Supprimé pour la production
                  setSelectedResponsable1('');
                  setSelectedResponsable2('');
                  setSnackbar({ open: true, message: i18nService.t('errors.api.getGroup'), severity: 'error' });
                }
            }
          }}
        >
          <DialogTitle sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {i18nService.t('networks.details.editGR')}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ pt: 2 }}>
              <TextField
                select
                fullWidth
                label={i18nService.t('networks.details.responsable1')}
                value={selectedResponsable1}
                onChange={e => setSelectedResponsable1(e.target.value)}
                sx={{ mb: 2, minWidth: 250 }}
                required
              >
                {networkData.available_users.map((user) => (
                  <MenuItem key={user.id || user._id} value={user.id || user._id}>
                    {user.username} (
                    <Typography 
                      component="span" 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    >
                      {formatQualificationWithFallback(user.qualification)}
                    </Typography>
                    )
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label={i18nService.t('networks.details.responsable2')}
                value={selectedResponsable2}
                onChange={e => setSelectedResponsable2(e.target.value)}
                sx={{ mb: 2, minWidth: 250 }}
                disabled={true}
                InputProps={{
                  style: { 
                    backgroundColor: '#f5f5f5',
                    color: '#666'
                  }
                }}
                helperText={i18nService.t('common.actions.fieldTemporarilyDisabled')}
              >
                <MenuItem value="">{i18nService.t('common.actions.none')}</MenuItem>
                {networkData.available_users.map((user) => (
                  <MenuItem key={user.id || user._id} value={user.id || user._id}>
                    {user.username} (
                    <Typography 
                      component="span" 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    >
                      {formatQualificationWithFallback(user.qualification)}
                    </Typography>
                    )
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setEditGrModal(false); setSelectedResponsable1(''); setSelectedResponsable2(''); }}>{i18nService.t('networks.details.cancel')}</Button>
            <Button
              variant="contained"
              onClick={() => {
                const groupId = selectedGr?.id || selectedGr?._id;
                if (!groupId) {
                  setSnackbar({ open: true, message: i18nService.t('networks.details.invalidGroupId'), severity: 'error' });
                  return;
                }
                
                const updateData = {
                  id: groupId,
                  responsable1_id: selectedResponsable1,
                  responsable2_id: selectedResponsable2 || null
                };
                
                                  // Debug des données de mise à jour - Supprimé pour la production
                  handleEditGr(updateData);
                }}
              color="primary"
              disabled={!canUpdateGroups || !selectedResponsable1}
              title={getHelpMessage(canUpdateGroups)}
            >
              {i18nService.t('common.actions.edit')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal d'édition de membre */}
        <Dialog 
          open={editMemberModal} 
          onClose={() => setEditMemberModal(false)} 
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
            {i18nService.t('networks.details.editMember')}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ pt: 2 }}>
              {/* Section Photo de profil - Centrée et stylée */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
                p: 2,
                backgroundColor: '#f8f9fa',
                borderRadius: 1,
                border: '2px dashed var(--upload-dashed)',
                boxShadow: '0 1px 8px var(--upload-shadow-light)'
              }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 'bold',
                    color: 'primary.main',
                    textAlign: 'center'
                  }}
                >
                  {i18nService.t('auth.register.profileImage')}
                </Typography>
                
                {/* Aperçu de l'image - Centré */}
                {(editMemberForm.image || editImagePreview) ? (
                  <Box sx={{ 
                    position: 'relative',
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    mb: 1.5 
                  }}>
                    <img
                      src={editImagePreview || getImageUrl(editMemberForm.image)}
                      alt="Aperçu de la photo de profil"
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #fff',
                        boxShadow: '0 1px 8px rgba(0,0,0,0.15)',
                        marginBottom: 12
                      }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={handleEditRemoveImage}
                      disabled={!canUpdateUsers}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        left: -8,
                        bgcolor: 'white',
                        border: '2px solid',
                        borderColor: 'error.main',
                        '&:hover': {
                          bgcolor: 'error.light',
                          color: 'white'
                        }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 1.5
                  }}>
                    <Box sx={{
                      width: 90,
                      height: 90,
                      borderRadius: '50%',
                      backgroundColor: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                      border: '2px dashed #ccc'
                    }}>
                      <PersonIcon sx={{ fontSize: 32, color: '#999' }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Aucune image sélectionnée
                    </Typography>
                  </Box>
                )}
                
                {/* Bouton d'upload */}
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  disabled={!canUpdateUsers}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'white',
                      boxShadow: '0 3px 8px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {editMemberForm.image || editImagePreview 
                    ? i18nService.t('auth.register.changeImage') 
                    : i18nService.t('auth.register.selectImage')
                  }
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleEditImageSelect}
                  />
                </Button>
                
                {/* Caption pour les formats acceptés */}
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 0.5, 
                    fontSize: '0.7rem',
                    textAlign: 'center'
                  }}
                >
                  Formats acceptés: JPG, PNG, GIF (max 5MB)
                </Typography>
              </Box>

              <TextField
                fullWidth
                label={i18nService.t('networks.details.username')}
                value={editMemberForm.username}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, username: e.target.value })}
                sx={{ mb: 2 }}
                required
                disabled={!canUpdateUsers}
                title={getHelpMessage(canUpdateUsers)}
              />
              <TextField
                fullWidth
                label={i18nService.t('networks.details.pseudo')}
                value={editMemberForm.pseudo}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, pseudo: e.target.value })}
                sx={{ mb: 2 }}
                disabled={!canUpdateUsers}
                title={getHelpMessage(canUpdateUsers)}
              />
              <TextField
                fullWidth
                label={i18nService.t('networks.details.email')}
                value={editMemberForm.email}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, email: e.target.value })}
                sx={{ mb: 2 }}
                disabled={!canUpdateUsers}
                title={getHelpMessage(canUpdateUsers)}
              />
              <TextField
                fullWidth
                label={i18nService.t('networks.details.telephone')}
                value={editMemberForm.telephone}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, telephone: e.target.value })}
                sx={{ mb: 2 }}
                disabled={!canUpdateUsers}
                title={getHelpMessage(canUpdateUsers)}
              />
              <TextField
                fullWidth
                label={i18nService.t('networks.details.address')}
                value={editMemberForm.adresse}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, adresse: e.target.value })}
                sx={{ mb: 2 }}
                disabled={!canUpdateUsers}
                title={getHelpMessage(canUpdateUsers)}
              />
              {/* Section Upload d'image pour édition */}
              <TextField
                select
                fullWidth
                label={i18nService.t('networks.details.genre')}
                value={editMemberForm.genre}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, genre: e.target.value })}
                sx={{ mb: 2 }}
                disabled={!canUpdateUsers}
                title={getHelpMessage(canUpdateUsers)}
              >
                {GENRE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label={i18nService.t('networks.details.ageRange')}
                value={editMemberForm.tranche_age}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, tranche_age: e.target.value })}
                sx={{ mb: 2 }}
                disabled={!canUpdateUsers}
                title={getHelpMessage(canUpdateUsers)}
              >
                {TRANCHE_AGE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label={i18nService.t('networks.details.profession')}
                value={editMemberForm.profession}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, profession: e.target.value })}
                sx={{ mb: 2 }}
                disabled={!canUpdateUsers}
                title={getHelpMessage(canUpdateUsers)}
              />
              <TextField
                fullWidth
                label={i18nService.t('networks.details.residenceCity')}
                value={editMemberForm.ville_residence}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, ville_residence: e.target.value })}
                sx={{ mb: 2 }}
                disabled={!canUpdateUsers}
                title={getHelpMessage(canUpdateUsers)}
              />
              <TextField
                select
                fullWidth
                label={i18nService.t('networks.details.origin')}
                value={editMemberForm.origine}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, origine: e.target.value })}
                sx={{ mb: 2 }}
                disabled={!canUpdateUsers}
                title={getHelpMessage(canUpdateUsers)}
              >
                {COUNTRIES.map((country) => (
                  <MenuItem key={country.value} value={country.value}>{country.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label={i18nService.t('networks.details.maritalStatus')}
                value={editMemberForm.situation_matrimoniale}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, situation_matrimoniale: e.target.value })}
                sx={{ mb: 2 }}
                disabled={!canUpdateUsers}
                title={getHelpMessage(canUpdateUsers)}
              >
                {SITUATION_MATRIMONIALE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label={i18nService.t('networks.details.educationLevel')}
                value={editMemberForm.niveau_education}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, niveau_education: e.target.value })}
                sx={{ mb: 2 }}
                disabled={!canUpdateUsers}
                title={getHelpMessage(canUpdateUsers)}
              >
                {NIVEAU_EDUCATION_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
              <FormControl fullWidth sx={{ mb: 2 }} disabled={!canUpdateUsers}>
                <InputLabel>{i18nService.t('auth.register.departments')}</InputLabel>
                <Select
                  multiple
                  value={editMemberForm.departement_ids || []}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, departement_ids: e.target.value })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const dept = departments.find(d => (d.id || d._id) === value);
                        return (
                          <Chip 
                            key={value} 
                            label={dept ? dept.nom : value} 
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id || dept._id} value={dept.id || dept._id}>
                      {dept.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                select
                fullWidth
                label={i18nService.t('networks.details.qualification')}
                value={editMemberForm.qualification}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, qualification: e.target.value })}
                sx={{ mb: 2 }}
                disabled={!canUpdateUsers}
                title={getHelpMessage(canUpdateUsers)}
              >
                {QUALIFICATION_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditMemberModal(false)}>{i18nService.t('networks.details.cancel')}</Button>
            <Button
              variant="contained"
              onClick={() => handleUpdateMember(editMemberForm)}
              disabled={!canUpdateUsers}
              title={getHelpMessage(canUpdateUsers)}
            >
              {i18nService.t('common.actions.edit')}
            </Button>
          </DialogActions>
        </Dialog>

      </Container>

      {/* Dialog de confirmation suppression GR */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title={i18nService.t('networks.details.deleteGr')}
        content={i18nService.t('networks.details.deleteGrContent')}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeleteGr}
      />
      <DeleteConfirmDialog
        open={deleteMemberDialogOpen}
        title={i18nService.t('networks.details.deleteMember')}
        content={i18nService.t('networks.details.deleteMemberContent')}
        onClose={handleCloseDeleteMemberDialog}
        onConfirm={handleConfirmDeleteMember}
      />

      {/* Snackbar feedback actions membres */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Modal de prévisionnel */}
      <PrevisionnelModal
        open={previsionnelModal}
        onClose={handlePrevisionnelModalClose}
        onSave={handleSavePrevisionnel}
        networkData={networkData}
        isLoading={previsionnelLoading}
      />

      {/* Modal d'assistance */}
      <AssistanceModal
        open={assistanceModal}
        onClose={handleAssistanceModalClose}
        onSave={handleSaveAssistance}
        networkData={networkData}
        isLoading={assistanceLoading}
      />

      {/* Modal d'historique */}
      <HistoriqueCulteModal
        open={historiqueModal}
        onClose={() => setHistoriqueModal(false)}
        networkData={networkData}
      />

      </Box>
    </AccessControl>
  );
};

// ... autres JSX du composant ...


export default NetworkDetails;
