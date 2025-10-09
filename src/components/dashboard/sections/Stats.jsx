import React, { useEffect } from 'react';
import { handleApiError } from '@utils/errorHandler';
import { Typography, Box, Grid, Paper, CircularProgress, IconButton } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useGlobalCache } from '@hooks/useGlobalCache';
import { apiService } from '@services/apiService';
import i18nService from '@services/i18nService';

const COLORS = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
    '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
    '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080',
    '#ffffff', '#000000', '#a28ef5', '#ffb6b9', '#00c49f',
    '#0088fe', '#ffc658', '#ff8042', '#7b68ee', '#f0e130'
];

const Stats = ({ selectedChurch, refreshKey }) => {
    // Initialiser i18nService
    useEffect(() => {
        i18nService.init();
    }, []);
    
    // Debug: afficher la valeur de selectedChurch
    // Debug de l'église sélectionnée - Supprimé pour la production

    // Utilisation du cache global pour éviter les rechargements
    const { data: stats, loading: statsLoading, error: statsError, refresh } = useGlobalCache(
        `globalStats-${selectedChurch?.id || 'none'}`,
        async () => {
            // Ne pas faire d'appel API si selectedChurch n'est pas valide
            if (!selectedChurch) {
                return {};
            }
            const params = { churchId: selectedChurch.id };
            try {
                const res = await apiService.stats.getOverview(params);
                return res.data?.data || res.data || {};
            } catch (error) {
                throw error;
            }
        },
        [refreshKey] // Dépendances pour forcer le rafraîchissement
    );

    const { data: networkStats, loading: networkStatsLoading, error: networkStatsError, refresh: refreshNetworkStats } = useGlobalCache(
        `networkStats-${selectedChurch?.id || 'none'}`,
        async () => {
            // Ne pas faire d'appel API si selectedChurch n'est pas valide
            if (!selectedChurch) {
                return [];
            }
            const params = { churchId: selectedChurch.id };
            const res = await apiService.networks.getStats(params);
            const rawData = res.data?.data || res.data || [];
            
            // Vérification de sécurité : s'assurer que rawData est un tableau
            if (!Array.isArray(rawData)) {
                return [];
            }
            
            // Transformer les données pour le graphique PieChart
            const transformedData = rawData.map(network => ({
                name: network.nom,
                value: network.memberCount || 0
            }));
            
            return transformedData;
        },
        [refreshKey] // Dépendances pour forcer le rafraîchissement
    );

    const { data: networkEvolution, loading: networkEvolutionLoading, error: networkEvolutionError, refresh: refreshNetworkEvolution } = useGlobalCache(
        `networkEvolution-${selectedChurch?.id || 'none'}`,
        async () => {
            // Ne pas faire d'appel API si selectedChurch n'est pas valide
            if (!selectedChurch) {
                return [];
            }
            const params = { churchId: selectedChurch.id };
            const res = await apiService.stats.getNetworksEvolution(params);
            const rawData = res.data?.data || res.data || [];
            
            // Vérification de sécurité : s'assurer que rawData est un tableau
            if (!Array.isArray(rawData)) {
                return [];
            }
            
            return rawData;
        },
        [refreshKey] // Dépendances pour forcer le rafraîchissement
    );

    const { data: serviceAttendance, loading: serviceAttendanceLoading, error: serviceAttendanceError, refresh: refreshServiceAttendance } = useGlobalCache(
        `serviceAttendance-${selectedChurch?.id || 'none'}`,
        async () => {
            // Ne pas faire d'appel API si selectedChurch n'est pas valide
            if (!selectedChurch) {
                return [];
            }
            const params = { churchId: selectedChurch.id };
            const res = await apiService.services.getAll(params);
            const rawData = res.data?.data || res.data || [];
            
            // Vérification de sécurité : s'assurer que rawData est un tableau
            if (!Array.isArray(rawData)) {
                return [];
            }
            
            return rawData;
        },
        [refreshKey] // Dépendances pour forcer le rafraîchissement
    );

    const { data: networkYearCompare, loading: networkYearCompareLoading, error: networkYearCompareError, refresh: refreshNetworkYearCompare } = useGlobalCache(
        `networkYearCompare-${selectedChurch?.id || 'none'}`,
        async () => {
            // Ne pas faire d'appel API si selectedChurch n'est pas valide
            if (!selectedChurch) {
                return [];
            }
            const currentYear = new Date().getFullYear();
            const lastYear = currentYear - 1;
            const params = { years: `${lastYear},${currentYear}`, churchId: selectedChurch.id };
            const res = await apiService.stats.getNetworksComparison(params);
            const rawData = res.data?.data || res.data || [];
            
            // Vérification de sécurité : s'assurer que rawData est un tableau
            if (!Array.isArray(rawData)) {
                return [];
            }
            
            return rawData;
        },
        [refreshKey] // Dépendances pour forcer le rafraîchissement
    );

    // Rafraîchissement automatique quand selectedChurch change
    useEffect(() => {
        if (selectedChurch) {
            // Rafraîchir les données avec des délais échelonnés pour éviter les appels simultanés
            const timer1 = setTimeout(() => refresh(), 100);
            const timer2 = setTimeout(() => refreshNetworkStats(), 300);
            const timer3 = setTimeout(() => refreshNetworkEvolution(), 500);
            const timer4 = setTimeout(() => refreshServiceAttendance(), 700);
            const timer5 = setTimeout(() => refreshNetworkYearCompare(), 900);
            
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
                clearTimeout(timer4);
                clearTimeout(timer5);
            };
        }
    }, [selectedChurch]); // Dépendance unique : selectedChurch

    // Protection : ne pas afficher les données si selectedChurch n'est pas valide
    if (!selectedChurch) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <Typography variant="h6" color="text.secondary">
                    {i18nService.t('stats.selectChurch')}
                </Typography>
            </Box>
        );
    }

    // Variables pour les calculs
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // État de chargement global
    const isLoading = statsLoading || networkStatsLoading || networkEvolutionLoading || serviceAttendanceLoading || networkYearCompareLoading;
    const hasError = statsError || networkStatsError || networkEvolutionError || serviceAttendanceError || networkYearCompareError;

    // Fonction pour afficher les erreurs de manière sécurisée
    const renderError = (error) => {
        if (!error) return null;
        
        // Si c'est un objet d'erreur Axios, extraire le message
        let errorMessage = i18nService.t('common.errorOccurred');
        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error?.message) {
            errorMessage = error.message;
        } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
        }
        
        // Masquer les erreurs techniques pour l'utilisateur final
        if (errorMessage.includes('Request failed with status code 500')) {
            errorMessage = i18nService.t('errors.server500');
        } else if (errorMessage.includes('Request failed with status code 429')) {
            errorMessage = i18nService.t('errors.tooManyRequests');
        }
        
        return (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                {errorMessage}
            </Typography>
        );
    };

    return (
        <Box sx={{ 
          width: '100%',
          overflow: 'hidden',
          overflowX: 'auto'
        }}>
            {/* Bloc stats globales */}
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
                    {i18nService.t('stats.overview')}
                  </Typography>
                  <Box sx={{ 
                    width: 80, 
                    height: 4, 
                    background: 'linear-gradient(90deg, #662d91, #9e005d, #9e005d)',
                    borderRadius: 2
                  }} />
                </Box>
                <IconButton onClick={refresh} disabled={isLoading} aria-label={i18nService.t('common.actions.refresh')}>
                    <RefreshIcon />
                </IconButton>
            </Box>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
            ) : hasError ? (
                renderError(hasError)
            ) : (
                <>
                    <Grid data-aos="fade-up" container spacing={2} sx={{ mb: 3 }}>
                        {[
                            { value: stats?.total_all || 0, label: i18nService.t('stats.members') },
                            { value: stats?.total_reseaux || 0, label: i18nService.t('stats.networks') },
                            { value: stats?.total_gr || 0, label: i18nService.t('stats.groups') },
                            { value: stats?.total_resp_reseaux || 0, label: i18nService.t('stats.networkLeaders') },
                            { value: stats?.total_resp_gr || 0, label: i18nService.t('stats.groupLeaders') },
                            { value: stats?.total_leaders || 0, label: i18nService.t('stats.leaders') },
                            { value: stats?.total_leaders_all || 0, label: i18nService.t('stats.allLeaders') },
                            { value: stats?.total_reguliers || 0, label: i18nService.t('stats.regulars') },
                            { value: stats?.total_integration || 0, label: i18nService.t('stats.integration') },
                            { value: stats?.total_irreguliers || 0, label: i18nService.t('stats.irregulars') },
                            { value: stats?.total_gouvernance || 0, label: i18nService.t('stats.governance') },
                            { value: stats?.total_ecodim || 0, label: i18nService.t('stats.ecodim') },
                            { value: stats?.total_resp_ecodim || 0, label: i18nService.t('stats.ecodimLeaders') },
                            { value: stats?.total_personnes_isolees || 0, label: i18nService.t('stats.isolatedPersons') }
                        ].map((item, idx) => (
                            <Grid xs={6} sm={4} md={3} lg={2} key={idx}>
                                <Paper 
                                  elevation={0}
                                  sx={{ 
                                    p: 2.5, 
                                    textAlign: 'center', 
                                    minHeight: 100,
                                    borderRadius: '16px',
                                    background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                                    border: '2px solid rgba(102, 45, 145, 0.1)',
                                    boxShadow: '0 4px 12px rgba(102, 45, 145, 0.08)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'translateY(-6px)',
                                      boxShadow: '0 12px 32px rgba(102, 45, 145, 0.15)',
                                      borderColor: 'primary.main'
                                    }
                                  }}
                                >
                                    <Typography color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>{item.label}</Typography>
                                    <Typography 
                                      variant="h4" 
                                      sx={{ 
                                        fontWeight: 800,
                                        background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                      }}
                                    >
                                      {item.value}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    <Grid data-aos="fade-up" container spacing={1} sx={{ display: 'block' }} >
                    {/* PieChart - Répartition membres par réseau + Interprétation à droite */}
                    <Grid xs={12} md={6} >
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 4, 
                            width: '100%',
                            borderRadius: '20px',
                            background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                            border: '2px solid rgba(102, 45, 145, 0.1)',
                            boxShadow: '0 10px 40px rgba(102, 45, 145, 0.08)',
                            overflowX: 'auto', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center' 
                          }}
                        >
                            <Typography 
                              variant="h5" 
                              gutterBottom 
                              sx={{ 
                                fontSize: 22,
                                fontWeight: 700,
                                color: 'primary.main',
                                mb: 3
                              }}
                            >
                              {i18nService.t('stats.membersByNetwork')}
                            </Typography>
                            
                            {/* Vérification des données */}
                            {!networkStats || networkStats.length === 0 ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        {networkStatsLoading ? i18nService.t('common.actions.loading') : i18nService.t('stats.noDataForChurch')}
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <Box >
                                        <Box sx={{ flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center' }}>
                                            <ResponsiveContainer width="100%" height={600}>
                                                <PieChart>
                                                    <Pie
                                                        data={networkStats}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={250}
                                                        label={(
                                                            ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                                                const RADIAN = Math.PI / 180;
                                                                const radius = innerRadius + (outerRadius - innerRadius) * 1.15;
                                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                                const value = networkStats?.[index]?.value || 0;
                                                                const total = (networkStats || []).reduce((sum, n) => sum + (n.value || 0), 0);
                                                                const percentValue = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                                                return (
                                                                    <text
                                                                        x={x}
                                                                        y={y}
                                                                        fill={COLORS[index % COLORS.length]}
                                                                        textAnchor={x > cx ? 'start' : 'end'}
                                                                        dominantBaseline="central"
                                                                        fontSize={16}
                                                                        fontWeight={600}
                                                                    >
                                                                        {`${networkStats[index]?.name}: ${value} (${percentValue}%)`}
                                                                    </text>
                                                                );
                                                            }
                                                        )}
                                                    >
                                                        {(networkStats || []).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ 
                                      background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)', 
                                      borderRadius: '16px', 
                                      border: '2px solid rgba(102, 45, 145, 0.1)', 
                                      p: 4,
                                      boxShadow: '0 4px 12px rgba(102, 45, 145, 0.08)'
                                    }}>
                                        {(() => {
                                            const date = new Date();
                                            const mois = date.toLocaleString('fr-FR', { month: 'long' });
                                            const annee = date.getFullYear();
                                            const jour = date.getDate();
                                            const total = (networkStats || []).reduce((sum, n) => sum + (n.value || 0), 0);
                                            const sorted = [...(networkStats || [])].sort((a, b) => (b.value || 0) - (a.value || 0));
                                            const plusGrand = sorted[0];
                                            const second = sorted[1];
                                            const debutMois = new Date(date.getFullYear(), date.getMonth(), 1);
                                            const reseauxNouveaux = (networkStats || []).filter(n => {
                                                if (!n.createdAt) return false;
                                                const d = new Date(n.createdAt);
                                                return d >= debutMois;
                                            });
                                            return (
                                                <Typography sx={{ fontSize: 18, color: '#444', fontStyle: 'italic', textAlign: 'center' }}>
                                                    {i18nService.t('stats.interpretation.datePrefix')}
                                                    <Box component="span" fontWeight="bold" color="primary.main">{`${jour} ${mois} ${annee}`}</Box>
                                                    {i18nService.t('stats.interpretation.totalMembers')}
                                                    <Box component="span" fontWeight="bold" color="primary.main">{total}</Box>
                                                    <Box component="span" fontWeight="bold" color="primary.main">{i18nService.t('stats.interpretation.persons')}</Box>
                                                    {plusGrand && (
                                                        <>
                                                            {i18nService.t('stats.interpretation.largestNetwork')}
                                                            <Box component="span" fontWeight="bold" color="primary.main">{` « ${plusGrand.name} »`}</Box>
                                                            {i18nService.t('stats.interpretation.with')}
                                                            <Box component="span" fontWeight="bold" color="primary.main">{plusGrand.value}</Box>
                                                            <Box component="span" fontWeight="bold" color="primary.main">{i18nService.t('stats.interpretation.members')}</Box>
                                                            {second && (
                                                                <>
                                                                    {i18nService.t('stats.interpretation.followedBy')}
                                                                    <Box component="span" fontWeight="bold" color="primary.main">{` « ${second.name} »`}</Box>
                                                                    {i18nService.t('stats.interpretation.parentheses')}
                                                                    <Box component="span" fontWeight="bold" color="primary.main">{second.value}</Box>
                                                                    <Box component="span" fontWeight="bold" color="primary.main">{i18nService.t('stats.interpretation.members')}</Box>
                                                                    {i18nService.t('stats.interpretation.closeParentheses')}
                                                                </>
                                                            )}
                                                            {reseauxNouveaux && reseauxNouveaux.length > 0 && (
                                                                <>
                                                                    {i18nService.t('stats.interpretation.inMonth')}
                                                                    <Box component="span" fontWeight="bold" color="primary.main">{`${mois} ${annee}`}</Box>
                                                                    {i18nService.t('stats.interpretation.networks')}
                                                                    <Box component="span" fontWeight="bold" color="primary.main">{(reseauxNouveaux || []).map(r => `« ${r.name} »`).join(', ')}</Box>
                                                                    {i18nService.t('stats.interpretation.wereCreated')}
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </Typography>
                                            );
                                        })()}
                                    </Box>
                                </>
                            )}
                        </Paper>
                    </Grid>

                    {/* LineChart - Evolution membres réseaux */}
                    <Grid data-aos="fade-up" xs={12} md={8} sx={{ minWidth: 400, mt: 3 }} >
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 4, 
                            height: 520, 
                            minWidth: 0, 
                            overflowX: 'auto', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center',
                            borderRadius: '20px',
                            background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                            border: '2px solid rgba(102, 45, 145, 0.1)',
                            boxShadow: '0 10px 40px rgba(102, 45, 145, 0.08)'
                          }}
                        >
                            <Typography 
                              variant="h5" 
                              gutterBottom 
                              sx={{ 
                                fontSize: 22,
                                fontWeight: 700,
                                color: 'primary.main',
                                mb: 3
                              }}
                            >{i18nService.t('stats.monthlyEvolution')}</Typography>
                            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {(Array.isArray(networkEvolution) && networkEvolution.length > 0 && Object.keys(networkEvolution[0]).length > 1) ? (
                                    <ResponsiveContainer width="100%" height={440}>
                                        <LineChart data={networkEvolution} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis allowDecimals={false} />
                                            <RechartsTooltip />
                                            <Legend />
                                            {Object.keys(networkEvolution[0]).filter(k => k !== 'month').map((key, idx) => (
                                                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={false} />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Typography sx={{ color: '#888', fontSize: 20, textAlign: 'center', width: '100%' }}>
                                        {i18nService.t('stats.noMonthlyData')}
                                    </Typography>
                                )}
                            </Box>
                        </Paper>

                    </Grid>
                    {/* BarChart - Comparaison réseaux sur les 3 derniers mois */}
                    <Grid data-aos="fade-up" xs={12} md={8} sx={{ minWidth: 400, mt: 3 }}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 4, 
                            minHeight: 320,
                            borderRadius: '20px',
                            background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                            border: '2px solid rgba(102, 45, 145, 0.1)',
                            boxShadow: '0 10px 40px rgba(102, 45, 145, 0.08)'
                          }}
                        >
                            <Typography 
                              variant="h5" 
                              gutterBottom 
                              sx={{ 
                                fontSize: 22,
                                fontWeight: 700,
                                color: 'primary.main',
                                mb: 3
                              }}
                            >
                                {i18nService.t('stats.networkComparison')}
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={(() => {
                                    // networkEvolution = [{ month: '2025-02', R1: 10, R2: 15, ... }, ...]
                                    if (!networkEvolution || networkEvolution.length === 0) return [];
                                    // Prendre les 3 derniers mois
                                    const last3 = networkEvolution.slice(-3);
                                    // Obtenir la liste des réseaux (en-têtes, hors "month")
                                    const networks = Object.keys(last3[0] || {}).filter(k => k !== 'month');
                                    // Pour chaque réseau, construire un objet { network: 'Réseau', mois1: x, mois2: y, mois3: z }
                                    return (networks || []).map(network => {
                                        const obj = { network };
                                        (last3 || []).forEach((row, idx) => {
                                            // Format mois court FR
                                            const mois = new Date(row.month + '-01').toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
                                            obj[mois] = row[network] || 0;
                                        });
                                        return obj;
                                    });
                                })()}>
                                    <RechartsTooltip />
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="network" />
                                    <YAxis allowDecimals={false} />
                                    <Legend />
                                    {/* Générer dynamiquement les Bar pour chaque mois */}
                                    {(() => {
                                        if (!networkEvolution || networkEvolution.length === 0) return null;
                                        const last3 = networkEvolution.slice(-3);
                                        return (last3 || []).map((row, idx) => {
                                            const mois = new Date(row.month + '-01').toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
                                            const colors = ["#8884d8", "#82ca9d", "#ffc658"];
                                            return (
                                                <Bar
                                                    key={mois}
                                                    dataKey={mois}
                                                    fill={colors[idx % colors.length]}
                                                    name={mois.charAt(0).toUpperCase() + mois.slice(1)}
                                                    activeBar={false}
                                                />
                                            );
                                        });
                                    })()}
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                    {/* BarChart - Fréquentation cultes */}
                    <Grid data-aos="fade-up" xs={12} md={12} sx={{ minWidth: 400, mt: 3 }}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 4, 
                            height: 520, 
                            minWidth: 0, 
                            overflowX: 'auto', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center',
                            borderRadius: '20px',
                            background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
                            border: '2px solid rgba(102, 45, 145, 0.1)',
                            boxShadow: '0 10px 40px rgba(102, 45, 145, 0.08)'
                          }}
                        >
                            <Typography 
                              variant="h5" 
                              gutterBottom 
                              sx={{ 
                                fontSize: 22,
                                fontWeight: 700,
                                color: 'primary.main',
                                mb: 3
                              }}
                            >
                                {i18nService.t('stats.serviceAttendance')}
                            </Typography>
                            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ResponsiveContainer width="100%" height={440}>
                                    <LineChart data={(() => {
                                        // Préparer les 8 derniers dimanches distincts présents dans serviceAttendance (sur le jour uniquement)
                                        const allDays = (serviceAttendance || []).map(s => new Date(s.date).toISOString().slice(0, 10));
                                        const uniqueDays = [...new Set(allDays)];
                                        const sundaysStr = uniqueDays.sort().slice(-8);
                                        const grouped = (sundaysStr || []).map(dateStr => {
                                            const entry = { date: new Date(dateStr).toLocaleDateString('fr-FR') };
                                            [i18nService.t('stats.service1'), i18nService.t('stats.service2'), i18nService.t('stats.service3')].forEach((culteLabel, idx) => {
                                                const culte = (serviceAttendance || []).find(s =>
                                                    new Date(s.date).toISOString().slice(0, 10) === dateStr &&
                                                    s.culte === culteLabel
                                                );
                                                entry[`culte${idx + 1}`] = culte ?
                                                    (culte.total_adultes || 0) +
                                                    (culte.total_enfants || 0) +
                                                    (culte.total_chantres || 0) +
                                                    (culte.total_protocoles || 0) +
                                                    (culte.total_multimedia || 0) +
                                                    (culte.total_respo_ecodim || 0) +
                                                    (culte.total_animateurs_ecodim || 0) +
                                                    (culte.total_enfants_ecodim || 0)
                                                    : 0;
                                            });
                                            return entry;
                                        });
                                        return grouped;
                                    })()} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis allowDecimals={false} interval={0} tickCount={10} />
                                        <RechartsTooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="culte1" stroke="#1976d2" name={i18nService.t('stats.service1')} strokeWidth={2} dot={true} />
                                        <Line type="monotone" dataKey="culte2" stroke="#FFBB28" name={i18nService.t('stats.service2')} strokeWidth={2} dot={true} />
                                        <Line type="monotone" dataKey="culte3" stroke="#43a047" name={i18nService.t('stats.service3')} strokeWidth={2} dot={true} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
                </>
            )}
        </Box>
    );
};

export default Stats;