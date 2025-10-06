// Configuration des préférences utilisateur

// Langues disponibles
export const AVAILABLE_LANGUAGES = [
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧'
  },
  {
    code: 'es',
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸'
  }
];

// Thèmes disponibles
export const AVAILABLE_THEMES = [
  {
    code: 'light',
    name: 'Clair',
    icon: '☀️',
    description: 'Thème clair pour une utilisation en journée'
  },
  {
    code: 'dark',
    name: 'Sombre',
    icon: '🌙',
    description: 'Thème sombre pour une utilisation nocturne'
  },
  {
    code: 'auto',
    name: 'Automatique',
    icon: '🔄',
    description: 'Thème automatique selon vos préférences système'
  }
];

// Traductions pour l'interface
export const TRANSLATIONS = {
  fr: {
    profile: {
      title: 'Mon Profil',
      basicInfo: 'Informations de base',
      completeProfile: 'Profil complet',
      preferences: 'Préférences',
      language: 'Langue',
      theme: 'Thème',
      autoTheme: 'Thème automatique',
      lightTheme: 'Thème clair',
      darkTheme: 'Thème sombre',
      savePreferences: 'Sauvegarder les préférences',
      preferencesSaved: 'Préférences sauvegardées !',
      selectLanguage: 'Sélectionner une langue',
      selectTheme: 'Sélectionner un thème'
    },
    common: {
      save: 'Sauvegarder',
      cancel: 'Annuler',
      update: 'Mettre à jour',
      edit: 'Modifier',
      loading: 'Chargement...'
    }
  },
  en: {
    profile: {
      title: 'My Profile',
      basicInfo: 'Basic Information',
      completeProfile: 'Complete Profile',
      preferences: 'Preferences',
      language: 'Language',
      theme: 'Theme',
      autoTheme: 'Auto theme',
      lightTheme: 'Light theme',
      darkTheme: 'Dark theme',
      savePreferences: 'Save preferences',
      preferencesSaved: 'Preferences saved!',
      selectLanguage: 'Select a language',
      selectTheme: 'Select a theme'
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      update: 'Update',
      edit: 'Edit',
      loading: 'Loading...'
    }
  },
  es: {
    profile: {
      title: 'Mi Perfil',
      basicInfo: 'Información Básica',
      completeProfile: 'Perfil Completo',
      preferences: 'Preferencias',
      language: 'Idioma',
      theme: 'Tema',
      autoTheme: 'Tema automático',
      lightTheme: 'Tema claro',
      darkTheme: 'Tema oscuro',
      savePreferences: 'Guardar preferencias',
      preferencesSaved: '¡Preferencias guardadas!',
      selectLanguage: 'Seleccionar idioma',
      selectTheme: 'Seleccionar tema'
    },
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      update: 'Actualizar',
      edit: 'Editar',
      loading: 'Cargando...'
    }
  }
};

// Obtenir la traduction pour la langue actuelle
export const getTranslation = (language, key) => {
  const keys = key.split('.');
  let translation = TRANSLATIONS[language] || TRANSLATIONS.fr;
  
  for (const k of keys) {
    translation = translation?.[k];
    if (!translation) break;
  }
  
  return translation || key;
};
