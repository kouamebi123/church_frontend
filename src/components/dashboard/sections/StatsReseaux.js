import React, { useEffect } from 'react';
import { Typography, Box, Grid, Paper, CircularProgress, IconButton } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart, Bar } from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useGlobalCache } from '../../../hooks/useGlobalCache';
import { apiService } from '../../../services/apiService';
import i18nService from '../../../services/i18nService';

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#B455C6', '#FF6666', '#82ca9d', '#8884d8', '#ffc658', '#a4de6c', '#d0ed57'
];

// Fonction utilitaire pour calculer la croissance des réseaux
const computeGrowthData = (networkEvolution) => {
    if (!networkEvolution || networkEvolution.length === 0) return [];
    
    
    return networkEvolution.map(network => {
        
        if (!network.evolution || network.evolution.length < 2) {
            return { name: network.nom, croissance: i18nService.t('statsReseaux.new') };
        }
        
        const current = network.evolution[network.evolution.length - 1];
        const previous = network.evolution[network.evolution.length - 2];
        
        if (previous.memberCount === 0) {
            return { name: network.nom, croissance: i18nService.t('statsReseaux.new') };
        }
        
        const growth = ((current.memberCount - previous.memberCount) / previous.memberCount) * 100;
        return { name: network.nom, croissance: Math.round(growth) };
    });
};

const StatsReseaux = ({ selectedChurch, refreshKey }) => {
  // Initialiser i18nService
  useEffect(() => {
    i18nService.init();
  }, []);
  
  
  // Utilisation du cache global pour éviter les rechargements
  const { data: networkStats, loading: networkStatsLoading, error: networkStatsError, refresh } = useGlobalCache(
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
      const transformedData = rawData
        .filter(network => network && network.nom && (network.memberCount || 0) > 0)
        .map(network => ({
          name: network.nom || 'Réseau sans nom',
          value: network.memberCount || 0
        }));
      
      
      return transformedData;
    },
    [refreshKey] // Dépendances pour forcer le rafraîchissement
  );

  const { data: networkEvolution, loading: networkEvolutionLoading, error: networkEvolutionError, refresh: refreshEvolution } = useGlobalCache(
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

  const { data: networkYearCompare, loading: networkYearCompareLoading, error: networkYearCompareError, refresh: refreshYearCompare } = useGlobalCache(
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

  const { data: stackedData, loading: stackedDataLoading, error: stackedDataError, refresh: refreshStacked } = useGlobalCache(
    `networkQualificationStats-${selectedChurch?.id || 'none'}`,
    async () => {
      // Ne pas faire d'appel API si selectedChurch n'est pas valide
      if (!selectedChurch) {
        return [];
      }
      try {
        const params = { churchId: selectedChurch.id };
        const res = await apiService.networks.getQualificationStats(params);
        const rawData = res.data?.data || res.data || [];
        
        // Vérification de sécurité : s'assurer que rawData est un tableau
        if (!Array.isArray(rawData)) {
          return [];
        }
        
        // Transformer les données pour correspondre au format attendu par le composant
        const transformedData = rawData
          .filter(network => network && network.networkName && network.totalMembers > 0) // Filtrer les réseaux valides
          .map(network => {
            const baseData = {
              name: network.networkName
              // Note: value et networkId ne sont plus inclus pour éviter qu'ils apparaissent comme des barres
            };
            
            // Ajouter chaque qualification comme propriété séparée (seulement si > 0)
            if (network.qualifications && typeof network.qualifications === 'object') {
              Object.entries(network.qualifications).forEach(([qual, count]) => {
                if (qual && count !== undefined && count !== null && count > 0 && qual !== i18nService.t('statsReseaux.notSpecified')) {
                  baseData[qual] = count;
                }
              });
            }
            
            return baseData;
          })
          .filter(network => {
            // Ne garder que les réseaux qui ont au moins une qualification valide
            const hasQualifications = Object.keys(network).some(key => key !== 'name');
            return hasQualifications;
          });
        
        return transformedData;
      } catch (err) {
        return [];
      }
    }
  );

  // Rafraîchissement automatique quand selectedChurch change
  useEffect(() => {
    if (selectedChurch) {
      // Rafraîchir toutes les données avec un délai pour éviter les appels simultanés
      const timer = setTimeout(() => {
        refresh();
        refreshEvolution();
        refreshYearCompare();
        refreshStacked();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [selectedChurch]); // Dépendance unique : selectedChurch

  // Protection : ne pas afficher les données si selectedChurch n'est pas valide
  if (!selectedChurch) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Veuillez sélectionner une église pour voir les statistiques
        </Typography>
      </Box>
    );
  }

  // État de chargement global
  const isLoading = networkStatsLoading || networkEvolutionLoading || networkYearCompareLoading || stackedDataLoading;
  
  // Extraire les messages d'erreur en chaînes pour éviter les erreurs React
  const getErrorMessage = (error) => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    return i18nService.t('common.errorOccurred');
  };
  
  const hasError = getErrorMessage(networkStatsError) || 
                   getErrorMessage(networkEvolutionError) || 
                   getErrorMessage(networkYearCompareError) || 
                   getErrorMessage(stackedDataError);


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
    
    return (
      <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
        {errorMessage}
      </Typography>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>{i18nService.t('statsReseaux.title')}</Typography>
        <IconButton onClick={refresh} disabled={isLoading} aria-label={i18nService.t('common.actions.refresh')}>
          <RefreshIcon />
        </IconButton>
      </Box>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
      ) : hasError ? (
        renderError(hasError)
      ) : (
        <Grid >
          {/* PieChart - Effectif par réseau */}
          <Grid data-aos="fade-up" item xs={12} sx={{ mt: 0 }}>
            <Paper sx={{ p: 3, backgroundColor: '#f9f9f9', overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>{i18nService.t('statsReseaux.membersByNetwork')}</Typography>
              
              {/* Vérification des données */}
              {!networkStats || networkStats.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                  <Typography variant="h6" color="text.secondary">
                    {networkStatsLoading ? i18nService.t('common.loading') : i18nService.t('statsReseaux.noDataForChurch')}
                  </Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={600}>
                  <PieChart>
                    <Pie
                      data={networkStats}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={250}
                      label={({ name, value }) => {
                        if (!name || value === undefined || value === null) return '';
                        const total = (networkStats || []).reduce((sum, n) => sum + (n.value || 0), 0);
                        const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                        return `${name}: ${value} (${percent}%)`;
                      }}
                    >
                      {(networkStats || []).map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, border: '1px solid #e0e0e0', p: 4 }}>
                {(() => {
                  const date = new Date();
                  const mois = date.toLocaleString('fr-FR', { month: 'long' });
                  const annee = date.getFullYear();
                  const jour = date.getDate();
                  const total = (networkStats || []).reduce((sum, n) => sum + (n.value || 0), 0);
                  const sorted = [...(networkStats || [])].filter(n => n && n.value !== undefined && n.value !== null).sort((a, b) => (b.value || 0) - (a.value || 0));
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
                      {i18nService.t('statsReseaux.interpretation.datePrefix')}
                      <Box component="span" fontWeight="bold" color="primary.main">{`${jour} ${mois} ${annee}`}</Box>
                      {i18nService.t('statsReseaux.interpretation.totalMembers')}
                      <Box component="span" fontWeight="bold" color="primary.main">{total}</Box>
                      <Box component="span" fontWeight="bold" color="primary.main">{" personnes."}</Box>
                      {plusGrand && plusGrand.name && plusGrand.value && (
                        <>
                          {" Le plus grand réseau est "}
                          <Box component="span" fontWeight="bold" color="primary.main">{` « ${plusGrand.name} »`}</Box>
                          {" avec "}
                          <Box component="span" fontWeight="bold" color="primary.main">{plusGrand.value}</Box>
                          <Box component="span" fontWeight="bold" color="primary.main">{" membres"}</Box>
                          {second && second.name && second.value && (
                            <>
                              {", suivi du réseau "}
                              <Box component="span" fontWeight="bold" color="primary.main">{` « ${second.name} »`}</Box>
                              {" ("}
                              <Box component="span" fontWeight="bold" color="primary.main">{second.value}</Box>
                              <Box component="span" fontWeight="bold" color="primary.main">{" membres"}</Box>
                              {")"}
                            </>
                          )}
                          {"."}
                        </>
                      )}
                      {reseauxNouveaux.length > 0 && reseauxNouveaux.every(r => r && r.name) && (
                        <>
                          {" "}
                          {reseauxNouveaux.length === 1 ? (
                            <>
                              {i18nService.t('statsReseaux.inMonth')}
                              <Box component="span" fontWeight="bold" color="primary.main">{`${mois} ${annee}`}</Box>
                              {", le réseau "}
                              <Box component="span" fontWeight="bold" color="primary.main">{` « ${reseauxNouveaux[0].name} »`}</Box>
                              {" a vu le jour."}
                            </>
                          ) : (
                            <>
                              {i18nService.t('statsReseaux.inMonth')}
                              <Box component="span" fontWeight="bold" color="primary.main">{`${mois} ${annee}`}</Box>
                              {", les réseaux "}
                              <Box component="span" fontWeight="bold" color="primary.main">{(reseauxNouveaux || []).filter(r => r && r.name).map(r => `« ${r.name} »`).join(', ')}</Box>
                              {" ont vu le jour."}
                            </>
                          )}
                        </>
                      )}
                    </Typography>
                  );
                })()}
              </Box>
            </Paper>
          </Grid>
          {/* LineChart - Evolution membres réseaux */}
          <Grid data-aos="fade-up" item xs={12} sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, height: 520, minWidth: 0, overflowX: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>{i18nService.t('statsReseaux.monthlyEvolution')}</Typography>
              <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={440}>
                  <LineChart data={networkEvolution} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Legend />
                    {(networkEvolution || []).length > 0 && Object.keys((networkEvolution || [])[0] || {}).filter(k => k !== 'month').map((key, idx) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          {/* BarChart - Comparaison de l'évolution des réseaux (3 derniers mois) */}
          <Grid data-aos="fade-up" item xs={12} sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, minHeight: 320, backgroundColor: '#f9f9f9', overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>
                {i18nService.t('statsReseaux.networkComparison')}
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={(() => {
                  if (!networkEvolution || networkEvolution.length === 0) return [];
                  const last3 = networkEvolution.slice(-3);
                  const networks = Object.keys(last3[0] || {}).filter(k => k !== 'month');
                  return (networks || []).map(network => {
                    const obj = { network };
                    (last3 || []).forEach((row, idx) => {
                      const mois = new Date(row.month + '-01').toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
                      obj[mois] = row[network] || 0;
                    });
                    return obj;
                  });
                })()} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
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

          {/* Stacked Bar Chart - Composition interne des réseaux */}
          {stackedData && stackedData.length > 0 && (
            <Grid data-aos="fade-up" item xs={12} sx={{ mt: 4 }}>
              <Paper sx={{ p: 3, minHeight: 320, backgroundColor: '#f9f9f9', overflowX: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>
                  {i18nService.t('statsReseaux.internalComposition')}
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stackedData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Legend />
                    {/* Générer dynamiquement les Bar pour chaque catégorie */}
                    {(() => {
                      // Récupère toutes les catégories présentes dans tous les réseaux
                      const allCategories = Array.from(
                        new Set((stackedData || []).flatMap(obj => Object.keys(obj || {}).filter(k => k !== 'name')))
                      );
                      return (allCategories || []).map((cat, idx) => (
                        <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[idx % COLORS.length]} name={cat} />
                      ));
                    })()}

                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          )}
          {/* Bar/Line Chart - Taux de croissance (%) */}
          {networkEvolution && networkEvolution.length > 1 && (
            <Grid data-aos="fade-up" item xs={12} sx={{ mt: 4 }}>
              <Paper sx={{ p: 3, minHeight: 320, backgroundColor: '#f9f9f9', overflowX: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: 22 }}>
                  {i18nService.t('statsReseaux.growthRate')}
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={computeGrowthData(networkEvolution)} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} tickFormatter={v => v + '%'} />
                    <RechartsTooltip formatter={(value) => value !== null ? value + '%' : 'N/A'} />
                    <Legend />
                    <Bar dataKey="croissance" fill="#82ca9d" name={i18nService.t('statsReseaux.growth')} />
                  </BarChart>
                </ResponsiveContainer>
                {/* Interpretation Box for Growth Rate */}
                {(() => {
                  const growthData = computeGrowthData(networkEvolution);
                  if (!growthData.length) return null;
                  
                  const growing = (growthData || []).filter(n => typeof n.croissance === 'number' && n.croissance > 0);
                  const declining = (growthData || []).filter(n => typeof n.croissance === 'number' && n.croissance < 0);
                  const stagnant = (growthData || []).filter(n => n.croissance === 0);
                  const newOnes = (growthData || []).filter(n => n.croissance === i18nService.t('statsReseaux.new'));
                  
                  // Filtrer les données valides (avec des noms)
                  const validGrowing = growing.filter(n => n.name || n.nom);
                  const validDeclining = declining.filter(n => n.name || n.nom);
                  const validStagnant = stagnant.filter(n => n.name || n.nom);
                  const validNewOnes = newOnes.filter(n => n.name || n.nom);
                  
                  
                  // Ne pas afficher la boîte si aucune donnée valide
                  if (validGrowing.length === 0 && validDeclining.length === 0 && validStagnant.length === 0 && validNewOnes.length === 0) {
                    return null;
                  }
                  
                  return (
                    <Box sx={{ bgcolor: '#f9f9f9', borderRadius: 2, border: '1px solid #e0e0e0', p: 4, mt: 3 }}>
                      <Typography sx={{ fontSize: 18, color: '#444', fontStyle: 'italic', textAlign: 'center' }}>
                        {validGrowing.length > 0 && (
                          <>
                            <Box component="span" fontWeight="bold" color="success.main">
                              Réseaux en croissance : {validGrowing.map(n => `« ${n.name || n.nom} » (+${n.croissance}%)`).join(', ')}
                            </Box>.<br />
                          </>
                        )}
                        {validDeclining.length > 0 && (
                          <>
                            <Box component="span" fontWeight="bold" color="error.main">
                              Réseaux en baisse : {validDeclining.map(n => `« ${n.name || n.nom} » (${n.croissance}%)`).join(', ')}
                            </Box>.<br />
                          </>
                        )}
                        {validStagnant.length > 0 && (
                          <>
                            <Box component="span" fontWeight="bold" color="warning.main">
                              Réseaux stables : {validStagnant.map(n => `« ${n.name || n.nom} »`).join(', ')}
                            </Box>.<br />
                          </>
                        )}
                        {validNewOnes.length > 0 && (
                          <>
                            <Box component="span" fontWeight="bold" color="info.main">
                              Nouveaux réseaux : {validNewOnes.map(n => `« ${n.name || n.nom} »`).join(', ')}
                            </Box>.<br />
                          </>
                        )}
                      </Typography>
                    </Box>
                  );
                })()}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default StatsReseaux;
