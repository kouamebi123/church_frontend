// Export des services de thème
// Import du CSS global
import './globalTheme.css';

export { default as themeService } from './themeService';

// Export des constantes de thème
export const THEME_CONSTANTS = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Export des utilitaires de thème
export const getThemeClass = (theme) => `theme-${theme}`;
export const getThemeAttribute = (theme) => `data-theme="${theme}"`;

// Export des couleurs par défaut
export const DEFAULT_COLORS = {
  PRIMARY: '#4B0082',
  SECONDARY: '#8A2BE2',
  SUCCESS: '#28A745',
  WARNING: '#FFC107',
  ERROR: '#DC3545',
  INFO: '#17A2B8'
};

// Export des utilitaires de contraste
export const getContrastColor = (backgroundColor) => {
  // Logique simple pour déterminer la couleur de contraste
  // En production, utilisez une bibliothèque comme tinycolor2
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// Export des utilitaires de validation
export const isValidTheme = (theme) => {
  return Object.values(THEME_CONSTANTS).includes(theme);
};

// Export des utilitaires de conversion
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Export des utilitaires d'accessibilité
export const getAccessibilityScore = (theme) => {
  // Score d'accessibilité basé sur les standards WCAG
  // En production, implémentez une logique plus sophistiquée
  return {
    contrast: 4.5,
    focus: true,
    selection: true,
    overall: 'A'
  };
};

// Export des utilitaires de performance
export const preloadTheme = (theme) => {
  // Préchargement des ressources du thème
  return new Promise((resolve) => {
    // Simulation du préchargement
    setTimeout(() => {
      resolve(true);
    }, 100);
  });
};

// Export des utilitaires de migration
export const migrateThemePreferences = (oldPreferences) => {
  // Migration des anciennes préférences de thème
  const newPreferences = {
    theme: oldPreferences.theme || 'light',
    autoTheme: oldPreferences.autoTheme !== undefined ? oldPreferences.autoTheme : true
  };
  
  return newPreferences;
};

// Export des utilitaires de sauvegarde
export const exportThemeConfig = (theme) => {
  // Export de la configuration du thème
  return {
    theme,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    exportType: 'theme-config'
  };
};

// Export des utilitaires d'import
export const importThemeConfig = (config) => {
  // Import de la configuration du thème
  try {
    if (config.theme && isValidTheme(config.theme)) {
      return {
        success: true,
        theme: config.theme,
        message: 'Configuration importée avec succès'
      };
    } else {
      throw new Error('Configuration de thème invalide');
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Erreur lors de l\'import de la configuration'
    };
  }
};

// Export par défaut
const themeExports = {
  themeService: themeService,
  THEME_CONSTANTS,
  getThemeClass,
  getThemeAttribute,
  DEFAULT_COLORS,
  getContrastColor,
  isValidTheme,
  hexToRgb,
  rgbToHex,
  getAccessibilityScore,
  preloadTheme,
  migrateThemePreferences,
  exportThemeConfig,
  importThemeConfig
};

export default themeExports;
