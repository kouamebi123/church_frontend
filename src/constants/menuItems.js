import {
  People as PeopleIcon,
  Church as ChurchIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  GroupWork as GroupWorkIcon,
  Event as EventIcon,
  AccountTree as AccountTreeIcon,
  PeopleAlt as PeopleAltIcon,
  BusinessCenter as BusinessCenterIcon,
  Collections as CollectionsIcon,
  InsertChart as InsertChartIcon,
  Map as MapIcon,
  Assessment as AssessmentIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  List as ListIcon,
  History as HistoryIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import i18nService from '../services/i18nService';

export const menuItems = [
  {
    text: 'Statistiques',
    icon: <InsertChartIcon />,
    children: [
      { id: 'stats', text: i18nService.t('menu.overview'), icon: <BarChartIcon /> },
      { id: 'statsReseaux', text: i18nService.t('menu.networks'), icon: <GroupWorkIcon /> },
      { id: 'statsCultes', text: i18nService.t('menu.services'), icon: <EventIcon /> },
      { id: 'statsMembres', text: i18nService.t('menu.members'), icon: <PeopleIcon /> },
      { id: 'statsPrevisionnel', text: i18nService.t('menu.forecasts'), icon: <AssessmentIcon /> },
      { id: 'statsAssistance', text: i18nService.t('menu.attendance'), icon: <PeopleIcon /> },
    ]
  },
  {
    text: 'Réseaux',
    icon: <AccountTreeIcon />,
    children: [
      { id: 'networks', text: 'Gestion des réseaux', icon: <AccountTreeIcon /> },
      { id: 'networksRecap', text: 'Récapitulatif des effectifs', icon: <PeopleAltIcon /> },
      { id: 'chaineImpact', text: "Chaine d'impact", icon: <AccountTreeIcon /> },
    ]
  },
  {
    text: 'Membres',
    icon: <PeopleIcon />,
    children: [
      { id: 'users', text: 'Gestion des membres', icon: <PeopleIcon /> },
      { id: 'usersRetired', text: 'Membres retirés', icon: <PeopleAltIcon /> },
    ]
  },
  {
    text: 'Mission et Implantation',
    icon: <MapIcon />,
    children: [
      { id: 'missionImplantation', text: 'Carte interactive', icon: <MapIcon /> },
    ]
  },
  {
    text: 'Témoignages',
    icon: <RecordVoiceOverIcon />,
    children: [
      { id: 'testimonies', text: 'Gestion des témoignages', icon: <ListIcon /> },
      { id: 'testimoniesCulte', text: 'Témoignages de culte', icon: <RecordVoiceOverIcon /> },
    ]
  },
  {
    text: 'Historique',
    icon: <HistoryIcon />,
    children: [
      { id: 'history', text: 'Activités', icon: <TimelineIcon /> },
    ]
  },
  {
    text: 'Configuration',
    icon: <SettingsIcon />,
    children: [
      { id: 'churches', text: 'Églises', icon: <ChurchIcon /> },
      { id: 'departments', text: 'Départements', icon: <BusinessCenterIcon /> },
      { id: 'carousel', text: 'Carousel', icon: <CollectionsIcon /> }
    ]
  }
];
