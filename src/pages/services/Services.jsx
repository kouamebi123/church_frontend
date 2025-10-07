import React from 'react';
import i18nService from '@services/i18nService';
import { Box, Container, Typography, Button, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@components/Navbar';
import { usePermissions } from '@hooks/usePermissions';
import { useSelectedChurch } from '@hooks/useSelectedChurch';

const Services = () => {
  const location = useLocation();
  const isNewService = location.pathname === '/services/new';
  const { selectedChurch, churches, changeSelectedChurch } = useSelectedChurch();
  
  // Récupérer les permissions de l'utilisateur
  const { isAdmin, isSuperAdmin } = usePermissions();
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      pb: 6 
    }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ mt: 0, py: 4 }}>
        {/* Titre et filtre d'église sur la même ligne - Responsive */}
        <Box sx={{ 
          mb: 5, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 }
        }}>
          {/* Titre principal */}
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #5B21B6, #7C3AED, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
                mb: 1
              }}
            >
              {isNewService ? i18nService.t('services.title') : i18nService.t('services.list.title')}
            </Typography>
            <Box 
              sx={{ 
                width: '80px', 
                height: '4px', 
                background: 'linear-gradient(90deg, #5B21B6, #7C3AED, #8B5CF6)',
                borderRadius: '2px',
                mb: 2
              }} 
            />
            
            {/* Sous-titre avec l'église */}
            {selectedChurch && (
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 600,
                  fontStyle: 'italic'
                }}
              >
                {i18nService.t('services.list.church')} : {selectedChurch.nom}
              </Typography>
            )}
          </Box>
          
          {/* Filtre d'église pour les admins et super-admins */}
          {(isAdmin || isSuperAdmin) && (
            <FormControl sx={{ 
              minWidth: { xs: '100%', sm: 300 },
              maxWidth: { xs: '100%', sm: 400 }
            }}>
              <InputLabel id="services-church-select-label">{i18nService.t('services.list.filterByChurch')}</InputLabel>
              <Select
                id="services-church-select"
                name="church"
                value={selectedChurch?.id || ''}
                onChange={(e) => changeSelectedChurch(e.target.value)}
                label={i18nService.t('services.list.filterByChurch')}
                labelId="services-church-select-label"
                sx={{ backgroundColor: '#fdfdfd' }}
                autoComplete="off"
              >
                {churches.map((church) => (
                  <MenuItem key={church.id || church._id} value={church.id || church._id}>
                    {church.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {/* Bouton d'ajout de service - désactivé pour les admins */}
        {/*<Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
           Services {selectedChurch?.nom}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/services/new')}
            disabled={!canCreateServices}
            title={!canCreateServices ? i18nService.t('dashboard.members.permissions.adminReadOnly') : ""}
          >
            Ajouter un service
          </Button>
        </Box>*/}

        <Outlet />
      </Container>
    </Box>
  );
};

export default Services;
