import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Paper,
  Grid,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import { Language, Palette, Settings, Email } from '@mui/icons-material';
import { toast } from 'react-toastify';
import preferencesService from '@services/preferencesService';
import preferencesApiService from '@services/preferencesApiService';
import i18nService from '@services/i18nService';
import logger from '@utils/logger';



const UserPreferences = () => {
  const [preferences, setPreferences] = useState({
    language: 'fr',
    theme: 'light',
    autoTheme: true,
    email_notifications: true
  });
  const [initialPreferences, setInitialPreferences] = useState({
    language: 'fr',
    theme: 'light',
    autoTheme: true,
    email_notifications: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Charger les préférences au montage du composant
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const currentLanguage = i18nService.getCurrentLanguage();
        const autoTheme = preferencesService.getPreference('autoTheme') || true;
        
        // Charger les préférences depuis l'API
        const apiPreferences = await preferencesApiService.getPreferences();
        
        const loadedPreferences = {
          language: apiPreferences?.data?.language || currentLanguage,
          theme: apiPreferences?.data?.theme || 'light',
          autoTheme,
          email_notifications: apiPreferences?.data?.email_notifications ?? true
        };
        
        setPreferences(loadedPreferences);
        setInitialPreferences(loadedPreferences);
      } catch (error) {
        logger.error('Erreur lors du chargement des préférences:', error);
        // Utiliser les valeurs par défaut en cas d'erreur
        const currentLanguage = i18nService.getCurrentLanguage();
        const autoTheme = preferencesService.getPreference('autoTheme') || true;
        
        const defaultPreferences = {
          language: currentLanguage,
          theme: 'light',
          autoTheme,
          email_notifications: true
        };
        
        setPreferences(defaultPreferences);
        setInitialPreferences(defaultPreferences);
      }
    };

    loadPreferences();
  }, [preferences.theme]);

  // Détecter les changements
  useEffect(() => {
    // Comparer avec les valeurs initiales chargées
    const hasLanguageChanged = initialPreferences.language !== preferences.language;
    const hasThemeChanged = initialPreferences.theme !== preferences.theme;
    const hasAutoThemeChanged = initialPreferences.autoTheme !== preferences.autoTheme;
    const hasEmailNotificationsChanged = initialPreferences.email_notifications !== preferences.email_notifications;
    
    const changed = hasLanguageChanged || hasThemeChanged || hasAutoThemeChanged || hasEmailNotificationsChanged;
    setHasChanges(changed);
  }, [preferences, initialPreferences]);

  // Forcer la synchronisation des composants après sauvegarde
  useEffect(() => {
    if (forceUpdate > 0) {
      // Synchroniser les composants avec les nouveaux paramètres
      const currentLanguage = i18nService.getCurrentLanguage();
      
      setPreferences(prev => ({
        ...prev,
        language: currentLanguage,
        theme: prev.theme
      }));
    }
  }, [forceUpdate]);

  // Gérer les changements de préférences
  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Marquer qu'il y a des changements
    setHasChanges(true);
  };

  // Sauvegarder les préférences
  const handleSavePreferences = async () => {
    setIsLoading(true);
    
    try {
      // Appliquer tous les changements lors de la sauvegarde
      i18nService.setLanguage(preferences.language);
      // setTheme(preferences.theme); // DÉSACTIVÉ TEMPORAIREMENT
      
      // Sauvegarder via les services locaux
      preferencesService.setPreference('autoTheme', preferences.autoTheme);
      
      // Sauvegarder les préférences via l'API
      try {
        const apiResponse = await preferencesApiService.updatePreferences({
          email_notifications: preferences.email_notifications,
          language: preferences.language,
          theme: preferences.theme
        });
        
        // Vérifier que la réponse API est valide
        if (apiResponse && apiResponse.success) {
          logger.debug('✅ Préférences sauvegardées avec succès via l\'API');
        } else {
          logger.warn('⚠️ Réponse API inattendue:', apiResponse);
        }
      } catch (apiError) {
        logger.error('❌ Erreur API lors de la sauvegarde des préférences:', apiError);
        toast.error('Erreur lors de la sauvegarde sur le serveur, mais les changements locaux sont appliqués');
        // Continuer même si l'API échoue, car les changements locaux sont déjà appliqués
      }
      
      // Forcer la mise à jour des composants
      setForceUpdate(prev => prev + 1);
      
      // Déclencher un événement global pour forcer la mise à jour de tous les composants
      window.dispatchEvent(new CustomEvent('languageOrThemeChanged', {
        detail: {
          language: preferences.language,
          theme: preferences.theme,
          timestamp: Date.now()
        }
      }));
      
      toast.success(i18nService.t('success.preferencesSaved'));
      setHasChanges(false);
      // Mettre à jour les préférences initiales après sauvegarde
      setInitialPreferences(preferences);
    } catch (error) {
      toast.error(i18nService.t('errors.general'));
      logger.error('Erreur de sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialiser les préférences
  const handleResetPreferences = () => {
    const defaultPreferences = {
      language: 'fr',
      theme: 'light',
      autoTheme: true
    };
    
    setPreferences(defaultPreferences);
    
    // Appliquer les préférences par défaut
    i18nService.setLanguage('fr');
    // setTheme('light'); // DÉSACTIVÉ TEMPORAIREMENT
    
    setHasChanges(false);
    // Mettre à jour les préférences initiales après réinitialisation
    setInitialPreferences(preferences);
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 4, 
        mb: 3,
        borderRadius: '24px',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F3FF 100%)',
        border: '2px solid rgba(102, 45, 145, 0.1)',
        boxShadow: '0 10px 40px rgba(102, 45, 145, 0.08)'
      }}
    >
      <Box display="flex" alignItems="center" mb={3}>
        <Box sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 2,
          boxShadow: '0 4px 12px rgba(102, 45, 145, 0.25)'
        }}>
          <Settings sx={{ color: 'white' }} />
        </Box>
        <Typography 
          variant="h5" 
          component="h3"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, rgb(59, 20, 100) 0%, #662d91 50%, #9e005d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {i18nService.t('profile.preferences.title')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Section Langue */}
        <Grid item xs={12} md={6}>
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Language sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                {i18nService.t('profile.preferences.language.title')}
              </Typography>
            </Box>
            
            <FormControl fullWidth>
              <InputLabel id="preferences-language-label">
                {i18nService.t('profile.preferences.language.title')}
              </InputLabel>
              <Select
                id="preferences-language"
                name="language"
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                label={i18nService.t('profile.preferences.language.title')}
                labelId="preferences-language-label"
                autoComplete="off"
              >
                {i18nService.getAvailableLanguages().map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    <Box display="flex" alignItems="center">
                      <span style={{ marginRight: '8px' }}>{lang.flag}</span>
                      <span>{lang.nativeName || lang.code.toUpperCase()}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            

          </Box>
        </Grid>

        {/* Section Notifications Email */}
        <Grid item xs={12} md={6}>
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Email sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                {i18nService.t('profile.preferences.email.title')}
              </Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  id="preferences-email-notifications"
                  name="email_notifications"
                  checked={preferences.email_notifications}
                  onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2">
                    {i18nService.t('profile.preferences.email.notifications')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {i18nService.t('profile.preferences.email.description')}
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Grid>

        {/* Section Thème - DÉSACTIVÉE TEMPORAIREMENT */}
        <Grid item xs={12} md={6}>
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Palette sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                {i18nService.t('profile.preferences.theme.title')}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {i18nService.t('profile.preferences.theme.disabled')}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Actions */}
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={handleResetPreferences}
          disabled={isLoading}
        >
          {i18nService.t('common.actions.reset')}
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSavePreferences}
          disabled={isLoading || !hasChanges}
          startIcon={isLoading ? null : null}
        >
          {isLoading ? i18nService.t('common.actions.saving') : i18nService.t('profile.actions.savePreferences')}
        </Button>
      </Box>

      {/* Indicateur de changements */}
      {hasChanges && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {i18nService.t('profile.preferences.unsavedChanges')}
        </Alert>
      )}


    </Paper>
  );
};

export default UserPreferences;
