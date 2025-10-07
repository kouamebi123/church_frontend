// Service de gestion des préférences utilisateur
import logger from '@utils/logger';
class PreferencesService {
  constructor() {
    this.storageKey = 'user_preferences';
    this.defaultPreferences = {
      language: 'fr',
      theme: 'light',
      autoTheme: true
    };
    this.loadPreferences();
  }

  // Charger les préférences depuis le localStorage
  loadPreferences() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.preferences = { ...this.defaultPreferences, ...JSON.parse(stored) };
      } else {
        this.preferences = { ...this.defaultPreferences };
      }
    } catch (error) {
      // logger.warn('Erreur lors du chargement des préférences:', error);
      this.preferences = { ...this.defaultPreferences };
    }
  }

  // Sauvegarder les préférences dans le localStorage
  savePreferences() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
    } catch (error) {
      // logger.error('Erreur lors de la sauvegarde des préférences:', error);
    }
  }

  // Obtenir une préférence
  getPreference(key) {
    return this.preferences[key];
  }

  // Définir une préférence
  setPreference(key, value) {
    this.preferences[key] = value;
    this.savePreferences();
    this.applyPreferences();
  }

  // Obtenir toutes les préférences
  getAllPreferences() {
    return { ...this.preferences };
  }

  // Appliquer les préférences
  applyPreferences() {
    // Appliquer le thème
    this.applyTheme();
    
    // Appliquer la langue
    this.applyLanguage();
  }

  // Appliquer le thème
  applyTheme() {
    const { theme, autoTheme } = this.preferences;
    
    if (autoTheme) {
      // Détecter automatiquement le thème système
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', systemTheme);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  // Appliquer la langue
  applyLanguage() {
    const { language } = this.preferences;
    document.documentElement.setAttribute('lang', language);
    
    // Émettre un événement pour notifier les composants
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
  }

  // Écouter les changements de thème système
  listenToSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      if (this.preferences.autoTheme) {
        this.applyTheme();
      }
    });
  }

  // Initialiser le service
  init() {
    this.applyPreferences();
    this.listenToSystemTheme();
  }
}

// Instance singleton
const preferencesService = new PreferencesService();


export default preferencesService;
