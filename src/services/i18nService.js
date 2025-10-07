import fr from '../assets/i18n/fr.json';
import en from '../assets/i18n/en.json';
import logger from '@utils/logger';


class I18nService {
  constructor() {
    this.translations = {
      fr,
      en
    };
    
    this.currentLanguage = this.getStoredLanguage() || 'fr';
    this.fallbackLanguage = 'fr';
    
    // Ne pas initialiser automatiquement dans le constructeur
    // this.init();
  }

  /**
   * Initialise le service i18n
   */
  init() {
    // Vérifier que nous sommes dans un environnement DOM
    if (typeof document === 'undefined') {
      // // logger.warn('i18nService: Pas d\'environnement DOM disponible');
      return;
    }
    
    // Appliquer la langue actuelle
    this.setLanguage(this.currentLanguage);
    
    // Écouter les changements de langue
    this.listenToLanguageChanges();
  }

  /**
   * Récupère la langue stockée dans localStorage
   */
  getStoredLanguage() {
    // Vérifier que localStorage est disponible
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem('user_language') || 'fr';
      } catch (error) {
        // logger.warn('i18nService: Impossible de récupérer la langue depuis localStorage:', error);
        return 'fr';
      }
    }
    return 'fr';
  }

  /**
   * Stocke la langue dans localStorage
   */
  setStoredLanguage(language) {
    // Vérifier que localStorage est disponible
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('user_language', language);
      } catch (error) {
        // logger.warn('i18nService: Impossible de stocker la langue dans localStorage:', error);
      }
    }
  }

  /**
   * Change la langue actuelle
   */
  setLanguage(language) {
    if (!this.translations[language]) {
      logger.warn(`Langue non supportée: ${language}, utilisation de la langue de fallback`);
      language = this.fallbackLanguage;
    }

    this.currentLanguage = language;
    this.setStoredLanguage(language);
    
    // Vérifier que nous sommes dans un environnement DOM
    if (typeof document !== 'undefined' && document.documentElement) {
      // Appliquer la langue au document
      document.documentElement.setAttribute('lang', language);
      
      // Déclencher l'événement de changement de langue
      this.dispatchLanguageChangeEvent();
    }
    
    logger.debug(`🌐 Langue changée vers: ${language}`);
  }

  /**
   * Récupère la langue actuelle
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Récupère la traduction pour une clé donnée
   */
  t(key, params = {}) {
    try {
      if (!key || typeof key !== 'string') {
        // logger.warn('i18nService: Clé de traduction invalide:', key);
        return key || 'Invalid key';
      }
      
      
      if (!this.translations || !this.translations[this.currentLanguage]) {
        // logger.warn('i18nService: Traductions non disponibles pour la langue:', this.currentLanguage);
        return key;
      }
      
      const keys = key.split('.');
      let translation = this.translations[this.currentLanguage];
      
      // Naviguer dans l'objet de traduction
      for (const k of keys) {
        if (translation && translation[k] !== undefined) {
          translation = translation[k];
        } else {
          // Essayer la langue de fallback
          let fallbackTranslation = this.translations[this.fallbackLanguage];
          for (const fk of keys) {
            if (fallbackTranslation && fallbackTranslation[fk] !== undefined) {
              fallbackTranslation = fallbackTranslation[fk];
            } else {
              fallbackTranslation = key; // Retourner la clé si aucune traduction n'est trouvée
              break;
            }
          }
          translation = fallbackTranslation;
          break;
        }
      }

      // Si la traduction est une chaîne, remplacer les paramètres
      if (typeof translation === 'string') {
        return this.replaceParams(translation, params);
      }

      return translation || key;
    } catch (error) {
      // logger.warn('i18nService: Erreur lors de la récupération de la traduction:', error);
      return key;
    }
  }

  /**
   * Remplace les paramètres dans une traduction
   */
  replaceParams(text, params) {
    try {
      if (!text || typeof text !== 'string') {
        return text;
      }
      
      if (!params || typeof params !== 'object') {
        return text;
      }
      
      let result = text;
      
      Object.keys(params).forEach(key => {
        try {
          const regex = new RegExp(`{${key}}`, 'g');
          result = result.replace(regex, params[key]);
        } catch (error) {
          // logger.warn('i18nService: Erreur lors du remplacement du paramètre:', key, error);
        }
      });
      
      return result;
    } catch (error) {
      // logger.warn('i18nService: Erreur lors du remplacement des paramètres:', error);
      return text;
    }
  }

  /**
   * Récupère toutes les langues disponibles
   */
  getAvailableLanguages() {
    try {
      if (!this.translations || typeof this.translations !== 'object') {
        // logger.warn('i18nService: Traductions non disponibles');
        return [];
      }
      
      return Object.keys(this.translations).map(code => ({
        code,
        name: this.translations[code]?.common?.languageName || code.toUpperCase(),
        nativeName: this.translations[code]?.common?.languageNativeName || code.toUpperCase(),
        flag: this.getLanguageFlag(code)
      }));
    } catch (error) {
      // logger.warn('i18nService: Erreur lors de la récupération des langues disponibles:', error);
      return [];
    }
  }

  /**
   * Récupère le drapeau pour une langue
   */
  getLanguageFlag(code) {
    try {
      if (!code || typeof code !== 'string') {
        return '🌍';
      }
      
      const flags = {
        fr: '🇫🇷',
        en: '🇬🇧'
      };
      return flags[code] || '🌍';
    } catch (error) {
      // logger.warn('i18nService: Erreur lors de la récupération du drapeau de la langue:', error);
      return '🌍';
    }
  }

  /**
   * Vérifie si une langue est supportée
   */
  isLanguageSupported(language) {
    return this.translations.hasOwnProperty(language);
  }

  /**
   * Récupère les informations sur la langue actuelle
   */
  getCurrentLanguageInfo() {
    try {
      const languages = this.getAvailableLanguages();
      return languages.find(lang => lang.code === this.currentLanguage) || null;
    } catch (error) {
      // logger.warn('i18nService: Erreur lors de la récupération des informations de la langue actuelle:', error);
      return null;
    }
  }

  /**
   * Déclenche l'événement de changement de langue
   */
  dispatchLanguageChangeEvent() {
    // Vérifier que nous sommes dans un environnement DOM
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      try {
        const event = new CustomEvent('languageChanged', {
          detail: {
            language: this.currentLanguage,
            languageInfo: this.getCurrentLanguageInfo()
          }
        });
        window.dispatchEvent(event);
      } catch (error) {
        // logger.warn('i18nService: Erreur lors de la création de l\'événement:', error);
      }
    }
  }

  /**
   * Écoute les changements de langue
   */
  listenToLanguageChanges() {
    // Vérifier que nous sommes dans un environnement DOM
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      try {
        window.addEventListener('languageChanged', (event) => {
          // Événement de changement de langue détecté
        });
      } catch (error) {
        //// logger.warn('i18nService: Erreur lors de l\'écoute des changements de langue:', error);
      }
    }
  }

  /**
   * Récupère la direction de la langue (LTR/RTL)
   */
  getLanguageDirection() {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(this.currentLanguage) ? 'rtl' : 'ltr';
  }

  /**
   * Applique la direction de la langue au document
   */
  applyLanguageDirection() {
    // Vérifier que nous sommes dans un environnement DOM
    if (typeof document !== 'undefined' && document.documentElement) {
      try {
        const direction = this.getLanguageDirection();
        document.documentElement.setAttribute('dir', direction);
      } catch (error) {
        // logger.warn('i18nService: Erreur lors de l\'application de la direction de la langue:', error);
      }
    }
  }

  /**
   * Récupère le format de date selon la langue
   */
  getDateFormat() {
    const formats = {
      fr: 'DD/MM/YYYY',
      en: 'MM/DD/YYYY'
    };
    return formats[this.currentLanguage] || formats.fr;
  }

  /**
   * Récupère le format d'heure selon la langue
   */
  getTimeFormat() {
    const formats = {
      fr: '24h',
      en: '12h'
    };
    return formats[this.currentLanguage] || formats.fr;
  }

  /**
   * Récupère le fuseau horaire par défaut selon la langue
   */
  getDefaultTimezone() {
    const timezones = {
      fr: 'Europe/Paris',
      en: 'UTC'
    };
    return timezones[this.currentLanguage] || timezones.fr;
  }

  /**
   * Formate un nombre selon la langue
   */
  formatNumber(number, options = {}) {
    const locales = {
      fr: 'fr-FR',
      en: 'en-US'
    };
    
    const locale = locales[this.currentLanguage] || locales.fr;
    
    return new Intl.NumberFormat(locale, options).format(number);
  }

  /**
   * Formate une date selon la langue
   */
  formatDate(date, options = {}) {
    const locales = {
      fr: 'fr-FR',
      en: 'en-US'
    };
    
    const locale = locales[this.currentLanguage] || locales.fr;
    
    // Options par défaut selon la langue
    const defaultOptions = {
      fr: {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      },
      en: {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    };
    
    const finalOptions = { ...defaultOptions[this.currentLanguage], ...options };
    
    return new Intl.DateTimeFormat(locale, finalOptions).format(date);
  }

  /**
   * Formate une heure selon la langue
   */
  formatTime(date, options = {}) {
    const locales = {
      fr: 'fr-FR',
      en: 'en-US'
    };
    
    const locale = locales[this.currentLanguage] || locales.fr;
    
    // Options par défaut selon la langue
    const defaultOptions = {
      fr: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      en: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    };
    
    const finalOptions = { ...defaultOptions[this.currentLanguage], ...options };
    
    return new Intl.DateTimeFormat(locale, finalOptions).format(date);
  }

  /**
   * Formate une devise selon la langue
   */
  formatCurrency(amount, currency = 'EUR', options = {}) {
    // Vérifier que Intl est disponible
    if (typeof Intl === 'undefined' || typeof Intl.NumberFormat === 'undefined') {
      // logger.warn('i18nService: Intl.NumberFormat non disponible');
      return amount.toString();
    }
    
    const locales = {
      fr: 'fr-FR',
      en: 'en-US'
    };
    
    const locale = locales[this.currentLanguage] || locales.fr;
    
    // Devise par défaut selon la langue
    const defaultCurrency = {
      fr: 'EUR',
      en: 'USD'
    };
    
    const finalCurrency = currency || defaultCurrency[this.currentLanguage];
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: finalCurrency,
        ...options
      }).format(amount);
    } catch (error) {
      // logger.warn('i18nService: Erreur lors du formatage de la devise:', error);
      return amount.toString();
    }
  }

  /**
   * Récupère les traductions pour une section spécifique
   */
  getSection(section) {
    try {
      if (!section || typeof section !== 'string') {
        // logger.warn('i18nService: Section invalide spécifiée');
        return {};
      }
      
      return this.translations[this.currentLanguage]?.[section] || {};
    } catch (error) {
      // logger.warn('i18nService: Erreur lors de la récupération de la section:', error);
      return {};
    }
  }

  /**
   * Récupère toutes les traductions de la langue actuelle
   */
  getAllTranslations() {
    try {
      return this.translations[this.currentLanguage] || {};
    } catch (error) {
      // logger.warn('i18nService: Erreur lors de la récupération de toutes les traductions:', error);
      return {};
    }
  }

  /**
   * Vérifie si une clé de traduction existe
   */
  hasTranslation(key) {
    try {
      if (!key || typeof key !== 'string') {
        return false;
      }
      
      const keys = key.split('.');
      let translation = this.translations[this.currentLanguage];
      
      for (const k of keys) {
        if (translation && translation[k] !== undefined) {
          translation = translation[k];
        } else {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      // logger.warn('i18nService: Erreur lors de la vérification de la traduction:', error);
      return false;
    }
  }

  /**
   * Ajoute des traductions personnalisées
   */
  addCustomTranslations(language, translations) {
    if (!language || !translations || typeof translations !== 'object') {
      // logger.warn('i18nService: Paramètres invalides pour addCustomTranslations');
      return;
    }
    
    if (!this.translations[language]) {
      this.translations[language] = {};
    }
    
    try {
      this.translations[language] = {
        ...this.translations[language],
        ...translations
      };
      
    } catch (error) {
      // logger.warn('i18nService: Erreur lors de l\'ajout des traductions personnalisées:', error);
    }
  }

  /**
   * Supprime des traductions personnalisées
   */
  removeCustomTranslations(language) {
    if (!language) {
      // logger.warn('i18nService: Langue non spécifiée pour removeCustomTranslations');
      return;
    }
    
    try {
      if (this.translations[language]) {
        delete this.translations[language];
      }
    } catch (error) {
      // logger.warn('i18nService: Erreur lors de la suppression des traductions personnalisées:', error);
    }
  }

  /**
   * Exporte les traductions actuelles
   */
  exportTranslations() {
    try {
      return {
        currentLanguage: this.currentLanguage,
        translations: this.translations[this.currentLanguage] || {},
        allLanguages: this.translations || {}
      };
    } catch (error) {
      // logger.warn('i18nService: Erreur lors de l\'export des traductions:', error);
      return {
        currentLanguage: this.fallbackLanguage,
        translations: {},
        allLanguages: {}
      };
    }
  }

  /**
   * Importe des traductions
   */
  importTranslations(translations) {
    try {
      if (translations && typeof translations === 'object') {
        this.translations = { ...this.translations, ...translations };
        return true;
      } else {
        // logger.warn('i18nService: Traductions invalides fournies');
        return false;
      }
    } catch (error) {
      // logger.error('❌ Erreur lors de l\'import des traductions:', error);
      return false;
    }
  }
}

// Créer une instance singleton
const i18nService = new I18nService();

export default i18nService;
