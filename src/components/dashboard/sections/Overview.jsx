import { Box, Typography, Grid } from '@mui/material';
import { handleApiError } from '@utils/errorHandler';
import PeopleIcon from '@mui/icons-material/People';
import NetworkIcon from '@mui/icons-material/NetworkCheck';
import { useState, useEffect } from 'react';
import { apiService } from '@services/apiService';
import OptimizedCard from '../../common/OptimizedCard';
import { useOptimizedData } from '@hooks/useOptimizedData';
import i18nService from '@services/i18nService';

const Overview = () => {
    const [stats, setStats] = useState({});

    // Initialiser le service i18n
    useEffect(() => {
        i18nService.init();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiService.stats.getOverview();
                setStats(res.data?.data || res.data || {});
            } catch (err) {
                const processedError = handleApiError(err, 'erreur lors de la récupération des stats');
            ;
            }
        };
        fetchStats();
    }, []);

    // Utilisation du hook optimisé pour traiter les données
    const optimizedStats = useOptimizedData(stats, [stats]);

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
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
                {i18nService.t('dashboard.overview.title')}
              </Typography>
              <Box sx={{ 
                width: 80, 
                height: 4, 
                background: 'linear-gradient(90deg, #662d91, #9e005d, #9e005d)',
                borderRadius: 2
              }} />
            </Box>
            <Grid container spacing={3}>
                {[
                    { value: optimizedStats.total_all, label: i18nService.t('dashboard.overview.stats.members'), icon: PeopleIcon },
                    { value: optimizedStats.total_reseaux, label: i18nService.t('dashboard.overview.stats.networks'), icon: NetworkIcon },
                    { value: optimizedStats.total_gr, label: i18nService.t('dashboard.overview.stats.groups'), icon: PeopleIcon },
                    { value: optimizedStats.total_resp_reseaux, label: i18nService.t('dashboard.overview.stats.networkLeaders'), icon: PeopleIcon },
                    { value: optimizedStats.total_resp_gr, label: i18nService.t('dashboard.overview.stats.groupLeaders'), icon: PeopleIcon },
                    { value: optimizedStats.total_leaders_all, label: i18nService.t('dashboard.overview.stats.allLeaders'), icon: PeopleIcon },
                ].map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <OptimizedCard
                            title={item.label}
                            value={item.value || 0}
                            icon={item.icon}
                            variant={index === 0 ? "primary" : "default"}
                        />
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    {i18nService.t('dashboard.overview.detailedStats')}
                </Typography>
                <Grid data-aos="fade-up" container spacing={3}>
                    {[
                        { label: i18nService.t('dashboard.overview.stats.regular'), value: optimizedStats.total_reguliers },
                        { label: i18nService.t('dashboard.overview.stats.integration'), value: optimizedStats.total_integration },
                        { label: i18nService.t('dashboard.overview.stats.irregular'), value: optimizedStats.total_irreguliers },
                        { label: i18nService.t('dashboard.overview.stats.allLeaders'), value: optimizedStats.total_leaders_all },
                        { label: i18nService.t('dashboard.overview.stats.networkLeaders'), value: optimizedStats.total_resp_reseaux },
                        { label: i18nService.t('dashboard.overview.stats.groupLeaders'), value: optimizedStats.total_resp_gr },
                        { label: i18nService.t('dashboard.overview.stats.totalMembers'), value: optimizedStats.total_all },
                        { label: i18nService.t('dashboard.overview.stats.networks'), value: optimizedStats.total_reseaux },
                        { label: i18nService.t('dashboard.overview.stats.groups'), value: optimizedStats.total_gr },
                    ].map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <OptimizedCard
                                title={item.label}
                                value={item.value || 0}
                                icon={PeopleIcon}
                                variant="default"
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default Overview;
