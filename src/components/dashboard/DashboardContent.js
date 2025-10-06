import React, { useMemo, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import i18nService from '../../services/i18nService';
import Stats from './sections/Stats';
import StatsReseaux from './sections/StatsReseaux';
import StatsCultes from './sections/StatsCultes';
import StatsPrevisionnel from './sections/StatsPrevisionnel';
import StatsAssistance from './sections/StatsAssistance';
import ChaineImpact from './sections/ChaineImpact';
import Networks from './sections/Networks';
import NetworksRecap from './sections/NetworksRecap';
import Carousel from './sections/Carousel';
import Membres from './sections/Membres';
import UsersRetired from './sections/UsersRetired';
import Churches from './sections/Churches';
import Departments from './sections/Departments';
import StatsMembres from './sections/StatsMembres';
import MissionImplantation from './sections/MissionImplantation';
import Testimonies from './sections/Testimonies';
import TestimoniesCulte from './sections/TestimoniesCulte';
import HistorySection from './sections/HistorySection';

const DashboardContent = React.memo(({ activeSection, selectedChurch, user, permissions, refreshKey }) => {
  // Initialiser le service i18n
  useEffect(() => {
    i18nService.init();
  }, []);

  // Mapping des sections avec leurs composants
  const sectionComponents = useMemo(() => ({
    stats: Stats,
    statsReseaux: StatsReseaux,
    statsCultes: StatsCultes,
    statsMembres: StatsMembres,
    statsPrevisionnel: StatsPrevisionnel,
    statsAssistance: StatsAssistance,
    chaineImpact: ChaineImpact,
    networks: Networks,
    networksRecap: NetworksRecap,
    carousel: Carousel,
    users: Membres,
    usersRetired: UsersRetired,
    churches: Churches,
    departments: Departments,
    missionImplantation: MissionImplantation,
    testimonies: Testimonies,
    testimoniesCulte: TestimoniesCulte,
    history: HistorySection
  }), []);

  // Récupérer le composant actif
  const ActiveComponent = sectionComponents[activeSection];

  // Rendu conditionnel optimisé
  const renderSection = useMemo(() => {
    if (!ActiveComponent) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            {i18nService.t('dashboard.menu.sectionNotFound')}
          </Typography>
        </Box>
      );
    }

    // Passer selectedChurch et user aux sections qui en ont besoin
    const sectionProps = {
      active: activeSection === 'missionImplantation',
      selectedChurch,
      user,
      refreshKey
    };

    return (
      <Box sx={{ 
        display: 'block',
        width: '100%',
        overflow: 'hidden' // Empêcher le scroll horizontal au niveau du conteneur principal
      }}>
        <ActiveComponent {...sectionProps} />
      </Box>
    );
  }, [ActiveComponent, activeSection, selectedChurch, user]);

  return renderSection;
});

DashboardContent.displayName = 'DashboardContent';

export default DashboardContent; 