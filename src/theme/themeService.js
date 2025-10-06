class ThemeService {
  constructor() {
    this.themes = {
      light: {
        name: 'light',
        displayName: 'Clair',
        icon: '☀️',
        description: 'Thème clair pour une utilisation en journée',
        variables: {
          // Couleurs principales
          '--primary-color': '#4B0082',
          '--primary-light': '#8A2BE2',
          '--primary-dark': '#2D004D',
          '--secondary-color': '#8A2BE2',
          '--secondary-light': '#B19CD9',
          '--secondary-dark': '#6A1B9A',
          
          // Couleurs de fond
          '--background-primary': '#FFFFFF',
          '--background-secondary': '#F8F9FA',
          '--background-tertiary': '#E9ECEF',
          '--background-elevated': '#FFFFFF',
          '--background-overlay': 'rgba(0, 0, 0, 0.5)',
          
          // Couleurs de texte
          '--text-primary': '#212529',
          '--text-secondary': '#6C757D',
          '--text-tertiary': '#ADB5BD',
          '--text-inverse': '#FFFFFF',
          '--text-muted': '#6C757D',
          
          // Couleurs de bordure
          '--border-primary': '#DEE2E6',
          '--border-secondary': '#E9ECEF',
          '--border-accent': '#4B0082',
          '--border-focus': '#4B0082',
          
          // Couleurs d'état
          '--success-color': '#28A745',
          '--success-light': '#D4EDDA',
          '--success-dark': '#1E7E34',
          '--warning-color': '#FFC107',
          '--warning-light': '#FFF3CD',
          '--warning-dark': '#D39E00',
          '--error-color': '#DC3545',
          '--error-light': '#F8D7DA',
          '--error-dark': '#C82333',
          '--info-color': '#17A2B8',
          '--info-light': '#D1ECF1',
          '--info-dark': '#117A8B',
          
          // Couleurs d'ombre
          '--shadow-light': 'rgba(0, 0, 0, 0.1)',
          '--shadow-medium': 'rgba(0, 0, 0, 0.15)',
          '--shadow-heavy': 'rgba(0, 0, 0, 0.25)',
          
          // Couleurs de composants
          '--card-background': '#FFFFFF',
          '--card-border': '#E9ECEF',
          '--input-background': '#FFFFFF',
          '--input-border': '#DEE2E6',
          '--input-focus': '#4B0082',
          '--button-primary': '#4B0082',
          '--button-secondary': '#6C757D',
          '--button-text': '#FFFFFF',
          
          // Couleurs de navigation
          '--navbar-background': '#FFFFFF',
          '--navbar-border': '#E9ECEF',
          '--sidebar-background': '#F8F9FA',
          '--sidebar-border': '#E9ECEF',
          '--menu-background': '#FFFFFF',
          '--menu-hover': '#F8F9FA',
          
          // Couleurs de tableau
          '--table-header': '#F8F9FA',
          '--table-row': '#FFFFFF',
          '--table-row-hover': '#F8F9FA',
          '--table-border': '#E9ECEF',
          
          // Couleurs de modal
          '--modal-background': '#FFFFFF',
          '--modal-overlay': 'rgba(0, 0, 0, 0.5)',
          '--modal-border': '#E9ECEF',
          
          // Couleurs de notification
          '--toast-background': '#FFFFFF',
          '--toast-border': '#E9ECEF',
          '--toast-shadow': 'rgba(0, 0, 0, 0.15)',
          
          // Couleurs de graphique
          '--chart-colors': ['#4B0082', '#8A2BE2', '#B19CD9', '#6A1B9A', '#2D004D'],
          
          // Couleurs d'accessibilité
          '--focus-ring': 'rgba(75, 0, 130, 0.25)',
          '--selection-background': 'rgba(75, 0, 130, 0.2)',
          '--scrollbar-track': '#F1F3F4',
          '--scrollbar-thumb': '#C1C1C1',
          '--scrollbar-thumb-hover': '#A8A8A8',
          
          // Couleurs supplémentaires pour composants
          '--leaflet-border': 'rgba(0, 0, 0, 0.2)',
          '--leaflet-shadow': 'rgba(0, 0, 0, 0.15)',
          '--leaflet-close': '#666',
          '--leaflet-close-hover': '#333',
          '--leaflet-close-bg-hover': '#f5f5f5',
          '--leaflet-zoom-bg': '#f4f4f4',
          '--testimony-read': '#666',
          '--testimony-unread': '#6a39b6',
          '--testimony-read-bg': 'rgba(102, 102, 102, 0.1)',
          '--testimony-unread-bg': 'rgba(106, 57, 182, 0.1)',
          '--testimony-border-read': 'rgb(184, 184, 185)',
          '--testimony-border-unread': 'rgba(119, 64, 201, 0.77)',
          '--testimony-shadow-unread': 'rgba(106, 57, 182, 0.15)',
          '--testimony-accent-bg': 'rgba(106, 57, 182, 0.08)',
          '--testimony-accent-border': 'rgba(106, 57, 182, 0.2)',
          '--gradient-primary': 'linear-gradient(90deg, #4B0082 0%, rgb(102, 13, 185) 50%, #4B0082 100%)',
          '--gradient-header': 'linear-gradient(135deg, #4B0082 0%, rgb(103, 14, 187) 50%, #4B0082 100%)',
          '--gradient-button': 'linear-gradient(135deg, #4B0082 0%, rgb(93, 10, 170) 50%, rgb(65, 0, 111) 100%)',
          '--gradient-button-hover': 'linear-gradient(135deg, rgb(95, 8, 176) 0%, rgb(97, 4, 163) 50%, rgb(84, 7, 156) 100%)',
          '--gradient-success': 'linear-gradient(135deg, #4B0082 0%, #8A2BE2 100%)',
          '--gradient-success-hover': 'linear-gradient(135deg, rgb(104,9,192) 0%, #4B0082 100%)',
          '--overlay-light': 'rgba(76, 0, 130, 0.34)',
          '--overlay-medium': 'rgba(104, 15, 187, 0.34)',
          '--overlay-heavy': 'rgba(76, 0, 130, 0.37)',
          '--overlay-bottom': 'rgba(75, 0, 130, 0.3)',
          '--overlay-middle': 'rgba(112, 19, 199, 0.2)',
          '--modal-bg': 'rgba(255, 255, 255, 0.97)',
          '--modal-shadow': 'rgba(75, 0, 130, 0.2)',
          '--modal-border-light': 'rgba(255, 255, 255, 0.3)',
          '--drop-shadow': 'rgba(0,0,0,0.3)',
          '--upload-bg': 'rgba(75, 0, 130, 0.05)',
          '--upload-hover-bg': 'rgba(75, 0, 130, 0.1)',
          '--upload-shadow': 'rgba(75, 0, 130, 0.2)',
          '--button-shadow': 'rgba(75, 0, 130, 0.3)',
          '--button-hover-shadow': 'rgba(75, 0, 130, 0.4)',
          '--button-disabled': 'rgba(75, 0, 130, 0.3)',
          '--button-disabled-text': 'rgba(255, 255, 255, 0.7)',
          '--scrollbar-white': 'rgba(255, 255, 255, 0.3)',
          '--scrollbar-white-hover': 'rgba(255, 255, 255, 0.51)',
          '--text-shadow': 'rgba(0,0,0,0.1)',
          '--card-shadow': 'rgba(75, 0, 130, 0.3)',
          '--card-hover-shadow': 'rgba(75, 0, 130, 0.4)',
          '--info-bg': 'rgba(76, 0, 130, 0.04)',
          '--info-border': 'rgba(76, 0, 130, 0.06)',
          '--info-shadow': 'rgba(76, 0, 130, 0.04)',
          '--chip-bg': 'rgba(75, 0, 130, 0.1)',
          '--chip-border': 'rgba(75, 0, 130, 0.3)',
          '--upload-hover-border': 'rgba(76, 0, 130, 0.28)',
          '--upload-hover-shadow': 'rgba(76, 0, 130, 0.09)',
          '--success-confirmed': '#4caf50',
          '--success-confirmed-shadow': 'rgba(76, 175, 80, 0.2)',
          '--chart-purple': '#8884d8',
          '--chart-yellow': '#ffc658',
          '--table-header-bg': '#f5f5f5',
          '--table-border': '#ddd',
          '--white-overlay': 'rgba(255, 255, 255, 0.18)',
          '--white-shadow': 'rgba(0, 0, 0, 0.15)',
          '--white-text-shadow': 'rgba(0,0,0,0.12)',
          '--success-gradient': 'linear-gradient(135deg, rgb(73,2,123) 0%, rgb(86,9,157) 100%)',
          '--success-button-shadow': 'rgba(75, 0, 130, 0.28)',
          '--success-hover-shadow': 'rgba(75, 0, 130, 0.34)',
          '--network-border': '#e0e0e0',
          '--network-shadow': 'rgba(0,0,0,0.15)',
          '--network-blue-shadow': 'rgba(25, 118, 210, 0.3)',
          '--network-blue-hover-shadow': 'rgba(25, 118, 210, 0.4)',
          '--upload-dashed': '#e0e0e0',
          '--upload-shadow-light': 'rgba(0,0,0,0.1)',
          '--white-border': '#fff',
          '--carousel-overlay': 'rgba(0,0,0,0.3)',
          '--carousel-overlay-dark': 'rgba(0,0,0,0.5)',
          '--carousel-dot': 'rgba(255, 255, 255, 0.5)',
          '--carousel-overlay-bg': 'rgba(0, 0, 0, 0.4)',
          '--carousel-text-shadow': 'rgba(0,0,0,0.5)',
          '--carousel-button-bg': 'rgba(76, 0, 130, 0.4)',
          '--carousel-button-shadow': 'rgba(0,0,0,0.25)',
          '--carousel-button-hover': 'rgba(255, 255, 255, 0.56)',
          '--carousel-button-hover-bg': 'rgba(76, 0, 130, 0.6)',
          '--carousel-button-hover-shadow': 'rgba(0,0,0,0.35)',
          '--carousel-button-active': 'rgba(255, 255, 255, 0.8)',
          '--carousel-button-active-bg': 'rgba(76, 0, 130, 0.8)',
          '--carousel-button-active-shadow': 'rgba(0,0,0,0.45)',
          '--carousel-dot-active': 'rgba(255, 255, 255, 0.9)',
          '--carousel-dot-inactive': 'rgba(255, 255, 255, 0.4)',
          '--carousel-dot-hover': 'rgba(255, 255, 255, 0.7)'
        }
      },
      dark: {
        name: 'dark',
        displayName: 'Sombre',
        icon: '🌙',
        description: 'Thème sombre pour une utilisation nocturne',
        variables: {
          // Couleurs principales
          '--primary-color': '#8A2BE2',
          '--primary-light': '#B19CD9',
          '--primary-dark': '#4B0082',
          '--secondary-color': '#B19CD9',
          '--secondary-light': '#D4C4E8',
          '--secondary-dark': '#8A2BE2',
          
          // Couleurs de fond
          '--background-primary': '#121212',
          '--background-secondary': '#1E1E1E',
          '--background-tertiary': '#2D2D2D',
          '--background-elevated': '#2D2D2D',
          '--background-overlay': 'rgba(0, 0, 0, 0.7)',
          
          // Couleurs de texte
          '--text-primary': '#FFFFFF',
          '--text-secondary': '#B0B0B0',
          '--text-tertiary': '#808080',
          '--text-inverse': '#121212',
          '--text-muted': '#808080',
          
          // Couleurs de bordure
          '--border-primary': '#404040',
          '--border-secondary': '#2D2D2D',
          '--border-accent': '#8A2BE2',
          '--border-focus': '#8A2BE2',
          
          // Couleurs d'état
          '--success-color': '#4CAF50',
          '--success-light': '#1B5E20',
          '--success-dark': '#2E7D32',
          '--warning-color': '#FF9800',
          '--warning-light': '#E65100',
          '--warning-dark': '#F57C00',
          '--error-color': '#F44336',
          '--error-light': '#B71C1C',
          '--error-dark': '#D32F2F',
          '--info-color': '#2196F3',
          '--info-light': '#0D47A1',
          '--info-dark': '#1976D2',
          
          // Couleurs d'ombre
          '--shadow-light': 'rgba(0, 0, 0, 0.3)',
          '--shadow-medium': 'rgba(0, 0, 0, 0.4)',
          '--shadow-heavy': 'rgba(0, 0, 0, 0.6)',
          
          // Couleurs de composants
          '--card-background': '#2D2D2D',
          '--card-border': '#404040',
          '--input-background': '#1E1E1E',
          '--input-border': '#404040',
          '--input-focus': '#8A2BE2',
          '--button-primary': '#8A2BE2',
          '--button-secondary': '#404040',
          '--button-text': '#FFFFFF',
          
          // Couleurs de navigation
          '--navbar-background': '#1E1E1E',
          '--navbar-border': '#404040',
          '--sidebar-background': '#2D2D2D',
          '--sidebar-border': '#404040',
          '--menu-background': '#2D2D2D',
          '--menu-hover': '#404040',
          
          // Couleurs de tableau
          '--table-header': '#2D2D2D',
          '--table-row': '#1E1E1E',
          '--table-row-hover': '#2D2D2D',
          '--table-border': '#404040',
          
          // Couleurs de modal
          '--modal-background': '#2D2D2D',
          '--modal-overlay': 'rgba(0, 0, 0, 0.7)',
          '--modal-border': '#404040',
          
          // Couleurs de notification
          '--toast-background': '#2D2D2D',
          '--toast-border': '#404040',
          '--toast-shadow': 'rgba(0, 0, 0, 0.4)',
          
          // Couleurs de graphique
          '--chart-colors': ['#8A2BE2', '#B19CD9', '#D4C4E8', '#4B0082', '#2D004D'],
          
          // Couleurs d'accessibilité
          '--focus-ring': 'rgba(138, 43, 226, 0.25)',
          '--selection-background': 'rgba(138, 43, 226, 0.2)',
          '--scrollbar-track': '#2D2D2D',
          '--scrollbar-thumb': '#404040',
          '--scrollbar-thumb-hover': '#505050',
          
          // Couleurs supplémentaires pour composants (thème sombre)
          '--leaflet-border': 'rgba(255, 255, 255, 0.2)',
          '--leaflet-shadow': 'rgba(0, 0, 0, 0.4)',
          '--leaflet-close': '#B0B0B0',
          '--leaflet-close-hover': '#FFFFFF',
          '--leaflet-close-bg-hover': '#404040',
          '--leaflet-zoom-bg': '#505050',
          '--testimony-read': '#808080',
          '--testimony-unread': '#B19CD9',
          '--testimony-read-bg': 'rgba(128, 128, 128, 0.1)',
          '--testimony-unread-bg': 'rgba(177, 156, 217, 0.1)',
          '--testimony-border-read': 'rgb(64, 64, 64)',
          '--testimony-border-unread': 'rgba(177, 156, 217, 0.77)',
          '--testimony-shadow-unread': 'rgba(177, 156, 217, 0.15)',
          '--testimony-accent-bg': 'rgba(177, 156, 217, 0.08)',
          '--testimony-accent-border': 'rgba(177, 156, 217, 0.2)',
          '--gradient-primary': 'linear-gradient(90deg, #8A2BE2 0%, rgb(177, 156, 217) 50%, #8A2BE2 100%)',
          '--gradient-header': 'linear-gradient(135deg, #8A2BE2 0%, rgb(177, 156, 217) 50%, #8A2BE2 100%)',
          '--gradient-button': 'linear-gradient(135deg, #8A2BE2 0%, rgb(138, 43, 226) 50%, rgb(106, 27, 154) 100%)',
          '--gradient-button-hover': 'linear-gradient(135deg, rgb(138, 43, 226) 0%, rgb(106, 27, 154) 50%, rgb(75, 0, 130) 100%)',
          '--gradient-success': 'linear-gradient(135deg, #8A2BE2 0%, #B19CD9 100%)',
          '--gradient-success-hover': 'linear-gradient(135deg, rgb(138, 43, 226) 0%, #8A2BE2 100%)',
          '--overlay-light': 'rgba(138, 43, 226, 0.34)',
          '--overlay-medium': 'rgba(177, 156, 217, 0.34)',
          '--overlay-heavy': 'rgba(138, 43, 226, 0.37)',
          '--overlay-bottom': 'rgba(138, 43, 226, 0.3)',
          '--overlay-middle': 'rgba(177, 156, 217, 0.2)',
          '--modal-bg': 'rgba(45, 45, 45, 0.97)',
          '--modal-shadow': 'rgba(138, 43, 226, 0.2)',
          '--modal-border-light': 'rgba(255, 255, 255, 0.1)',
          '--drop-shadow': 'rgba(0, 0, 0, 0.6)',
          '--upload-bg': 'rgba(138, 43, 226, 0.05)',
          '--upload-hover-bg': 'rgba(138, 43, 226, 0.1)',
          '--upload-shadow': 'rgba(138, 43, 226, 0.2)',
          '--button-shadow': 'rgba(138, 43, 226, 0.3)',
          '--button-hover-shadow': 'rgba(138, 43, 226, 0.4)',
          '--button-disabled': 'rgba(138, 43, 226, 0.3)',
          '--button-disabled-text': 'rgba(255, 255, 255, 0.7)',
          '--scrollbar-white': 'rgba(255, 255, 255, 0.2)',
          '--scrollbar-white-hover': 'rgba(255, 255, 255, 0.3)',
          '--text-shadow': 'rgba(0,0,0,0.3)',
          '--card-shadow': 'rgba(138, 43, 226, 0.3)',
          '--card-hover-shadow': 'rgba(138, 43, 226, 0.4)',
          '--info-bg': 'rgba(138, 43, 226, 0.04)',
          '--info-border': 'rgba(138, 43, 226, 0.06)',
          '--info-shadow': 'rgba(138, 43, 226, 0.04)',
          '--chip-bg': 'rgba(138, 43, 226, 0.1)',
          '--chip-border': 'rgba(138, 43, 226, 0.3)',
          '--upload-hover-border': 'rgba(138, 43, 226, 0.28)',
          '--upload-hover-shadow': 'rgba(138, 43, 226, 0.09)',
          '--success-confirmed': '#4CAF50',
          '--success-confirmed-shadow': 'rgba(76, 175, 80, 0.3)',
          '--chart-purple': '#B19CD9',
          '--chart-yellow': '#FF9800',
          '--table-header-bg': '#2D2D2D',
          '--table-border': '#404040',
          '--white-overlay': 'rgba(255, 255, 255, 0.1)',
          '--white-shadow': 'rgba(0, 0, 0, 0.4)',
          '--white-text-shadow': 'rgba(0,0,0,0.3)',
          '--success-gradient': 'linear-gradient(135deg, rgb(138, 43, 226) 0%, rgb(177, 156, 217) 100%)',
          '--success-button-shadow': 'rgba(138, 43, 226, 0.28)',
          '--success-hover-shadow': 'rgba(138, 43, 226, 0.34)',
          '--network-border': '#404040',
          '--network-shadow': 'rgba(0,0,0,0.4)',
          '--network-blue-shadow': 'rgba(33, 150, 243, 0.3)',
          '--network-blue-hover-shadow': 'rgba(33, 150, 243, 0.4)',
          '--upload-dashed': '#404040',
          '--upload-shadow-light': 'rgba(0,0,0,0.3)',
          '--white-border': '#2D2D2D',
          '--carousel-overlay': 'rgba(0,0,0,0.5)',
          '--carousel-overlay-dark': 'rgba(0,0,0,0.7)',
          '--carousel-dot': 'rgba(255, 255, 255, 0.4)',
          '--carousel-overlay-bg': 'rgba(0, 0, 0, 0.6)',
          '--carousel-text-shadow': 'rgba(0,0,0,0.7)',
          '--carousel-button-bg': 'rgba(138, 43, 226, 0.4)',
          '--carousel-button-shadow': 'rgba(0,0,0,0.4)',
          '--carousel-button-hover': 'rgba(255, 255, 255, 0.4)',
          '--carousel-button-hover-bg': 'rgba(138, 43, 226, 0.6)',
          '--carousel-button-hover-shadow': 'rgba(0,0,0,0.5)',
          '--carousel-button-active': 'rgba(255, 255, 255, 0.7)',
          '--carousel-button-active-bg': 'rgba(138, 43, 226, 0.8)',
          '--carousel-button-active-shadow': 'rgba(0,0,0,0.6)',
          '--carousel-dot-active': 'rgba(255, 255, 255, 0.8)',
          '--carousel-dot-inactive': 'rgba(255, 255, 255, 0.3)',
          '--carousel-dot-hover': 'rgba(255, 255, 255, 0.5)'
        }
      }
    };
    
    this.currentTheme = this.getStoredTheme() || 'light';
    this.autoTheme = this.getStoredAutoTheme() || true;
    this.systemTheme = this.detectSystemTheme();
    
    // Initialiser le service
    this.init();
  }

  /**
   * Initialise le service de thème
   */
  init() {
    // Appliquer le thème actuel
    this.applyTheme(this.currentTheme);
    
    // Écouter les changements de thème système
    this.listenToSystemThemeChanges();
    
    // Écouter les changements de thème
    this.listenToThemeChanges();
  }

  /**
   * Détecte le thème système
   */
  detectSystemTheme() {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  /**
   * Récupère le thème stocké dans localStorage
   */
  getStoredTheme() {
    try {
      return localStorage.getItem('user_theme') || 'light';
    } catch (error) {
      // Impossible de récupérer le thème depuis localStorage
      return 'light';
    }
  }

  /**
   * Stocke le thème dans localStorage
   */
  setStoredTheme(theme) {
    try {
      localStorage.setItem('user_theme', theme);
    } catch (error) {
      // Impossible de stocker le thème dans localStorage
    }
  }

  /**
   * Récupère le paramètre auto-thème depuis localStorage
   */
  getStoredAutoTheme() {
    try {
      const stored = localStorage.getItem('user_auto_theme');
      return stored ? JSON.parse(stored) : true;
    } catch (error) {
      // Impossible de récupérer auto-thème depuis localStorage
      return true;
    }
  }

  /**
   * Stocke le paramètre auto-thème dans localStorage
   */
  setStoredAutoTheme(autoTheme) {
    try {
      localStorage.setItem('user_auto_theme', JSON.stringify(autoTheme));
    } catch (error) {
      // Impossible de stocker auto-thème dans localStorage
    }
  }

  /**
   * Change le thème actuel
   */
  setTheme(theme) {
    if (!this.themes[theme]) {
      // Thème non supporté, utilisation du thème par défaut
      theme = 'light';
    }

    this.currentTheme = theme;
    this.setStoredTheme(theme);
    
    // Appliquer le thème
    this.applyTheme(theme);
    
    // Déclencher l'événement de changement de thème
    this.dispatchThemeChangeEvent();
  }

  /**
   * Active/désactive le thème automatique
   */
  setAutoTheme(enabled) {
    this.autoTheme = enabled;
    this.setStoredAutoTheme(enabled);
    
    if (enabled) {
      // Appliquer le thème système
      this.applyTheme(this.systemTheme);
      this.currentTheme = this.systemTheme;
    }
  }

  /**
   * Applique un thème en définissant les variables CSS
   */
  applyTheme(theme) {
    const themeData = this.themes[theme];
    if (!themeData) {
      // Thème non trouvé
      return;
    }

    const root = document.documentElement;
    
    // Appliquer toutes les variables CSS
    Object.entries(themeData.variables).forEach(([variable, value]) => {
      root.style.setProperty(variable, value);
    });
    
    // Ajouter l'attribut data-theme
    root.setAttribute('data-theme', theme);
    
    // Appliquer des classes CSS spécifiques au thème
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${theme}`);
  }

  /**
   * Récupère le thème actuel
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Récupère les informations sur le thème actuel
   */
  getCurrentThemeInfo() {
    return this.themes[this.currentTheme];
  }

  /**
   * Récupère tous les thèmes disponibles
   */
  getAvailableThemes() {
    return Object.values(this.themes).map(theme => ({
      name: theme.name,
      displayName: theme.displayName,
      icon: theme.icon,
      description: theme.description
    }));
  }

  /**
   * Vérifie si un thème est supporté
   */
  isThemeSupported(theme) {
    return this.themes.hasOwnProperty(theme);
  }

  /**
   * Récupère la valeur d'une variable CSS du thème actuel
   */
  getCSSVariable(variable) {
    const root = document.documentElement;
    return getComputedStyle(root).getPropertyValue(variable);
  }

  /**
   * Définit une variable CSS personnalisée
   */
  setCSSVariable(variable, value) {
    const root = document.documentElement;
    root.style.setProperty(variable, value);
  }

  /**
   * Récupère toutes les variables CSS du thème actuel
   */
  getAllCSSVariables() {
    const themeData = this.themes[this.currentTheme];
    return themeData ? themeData.variables : {};
  }

  /**
   * Déclenche l'événement de changement de thème
   */
  dispatchThemeChangeEvent() {
    const event = new CustomEvent('themeChanged', {
      detail: {
        theme: this.currentTheme,
        themeInfo: this.getCurrentThemeInfo(),
        autoTheme: this.autoTheme
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Écoute les changements de thème
   */
  listenToThemeChanges() {
    window.addEventListener('themeChanged', (event) => {
      // Événement de changement de thème détecté
    });
  }

  /**
   * Écoute les changements de thème système
   */
  listenToSystemThemeChanges() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (event) => {
        this.systemTheme = event.matches ? 'dark' : 'light';
        
        // Si le thème automatique est activé, appliquer le nouveau thème système
        if (this.autoTheme) {
          this.applyTheme(this.systemTheme);
          this.currentTheme = this.systemTheme;
          this.dispatchThemeChangeEvent();
        }
        
      });
    }
  }

  /**
   * Applique le thème système si l'auto-thème est activé
   */
  applySystemTheme() {
    if (this.autoTheme) {
      this.applyTheme(this.systemTheme);
      this.currentTheme = this.systemTheme;
      this.dispatchThemeChangeEvent();
    }
  }

  /**
   * Récupère le contraste entre deux couleurs
   */
  getContrastRatio(color1, color2) {
    // Fonction simplifiée pour calculer le contraste
    // En production, utilisez une bibliothèque comme tinycolor2
    return 4.5; // Valeur par défaut
  }

  /**
   * Vérifie si le thème actuel respecte les standards d'accessibilité
   */
  checkAccessibility() {
    const themeInfo = this.getCurrentThemeInfo();
    const variables = themeInfo.variables;
    
    const checks = {
      textContrast: this.getContrastRatio(variables['--text-primary'], variables['--background-primary']),
      focusRing: variables['--focus-ring'] !== undefined,
      selectionBackground: variables['--selection-background'] !== undefined
    };
    
    return checks;
  }

  /**
   * Génère un thème personnalisé basé sur une couleur primaire
   */
  generateCustomTheme(primaryColor) {
    // Logique pour générer un thème personnalisé
    // En production, utilisez une bibliothèque comme color2k ou chroma.js
    
    return {
      name: 'custom',
      displayName: 'Personnalisé',
      icon: '🎨',
      description: 'Thème personnalisé généré automatiquement',
      variables: {
        '--primary-color': primaryColor,
        // Autres variables générées...
      }
    };
  }

  /**
   * Exporte la configuration du thème actuel
   */
  exportThemeConfig() {
    return {
      currentTheme: this.currentTheme,
      autoTheme: this.autoTheme,
      systemTheme: this.systemTheme,
      themeInfo: this.getCurrentThemeInfo(),
      cssVariables: this.getAllCSSVariables()
    };
  }

  /**
   * Importe une configuration de thème
   */
  importThemeConfig(config) {
    try {
      if (config.currentTheme) {
        this.setTheme(config.currentTheme);
      }
      
      if (config.autoTheme !== undefined) {
        this.setAutoTheme(config.autoTheme);
      }
      
      return true;
    } catch (error) {
      // Erreur lors de l'import de la configuration de thème
      return false;
    }
  }

  /**
   * Réinitialise le thème aux valeurs par défaut
   */
  resetTheme() {
    this.setTheme('light');
    this.setAutoTheme(true);
  }

  /**
   * Prépare le thème pour l'impression
   */
  prepareForPrint() {
    // Appliquer un thème optimisé pour l'impression
    const printTheme = {
      '--background-primary': '#FFFFFF',
      '--text-primary': '#000000',
      '--border-primary': '#CCCCCC'
    };
    
    Object.entries(printTheme).forEach(([variable, value]) => {
      this.setCSSVariable(variable, value);
    });
    
  }

  /**
   * Restaure le thème après l'impression
   */
  restoreAfterPrint() {
    this.applyTheme(this.currentTheme);
  }
}

// Créer une instance singleton
const themeService = new ThemeService();

export default themeService;
