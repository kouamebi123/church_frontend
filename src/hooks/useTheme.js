import { useEffect, useState } from 'react';

/**
 * Hook pour gérer la persistance du thème 
 * @returns {Object} - { theme, setTheme }
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState(() => {
    // Récupérer le thème depuis localStorage au chargement
    return localStorage.getItem('user_theme') || 'light';
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    
    // Appliquer le thème sur le contenu principal, pas sur la navbar
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      if (newTheme === 'dark') {
        mainContent.style.filter = 'grayscale(1)';
      } else {
        mainContent.style.filter = 'none';
      }
    } else {
      // Fallback: si pas de main-content, appliquer sur body mais exclure la navbar
      if (newTheme === 'dark') {
        document.body.style.filter = 'grayscale(1)';
        // Exclure la navbar du filtre
        const navbar = document.querySelector('nav, [role="navigation"]');
        if (navbar) {
          navbar.style.filter = 'none';
        }
      } else {
        document.body.style.filter = 'none';
      }
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('user_theme', newTheme);
  };

  // Restaurer le thème au chargement de la page
  useEffect(() => {
    const savedTheme = localStorage.getItem('user_theme');
    if (savedTheme) {
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        if (savedTheme === 'dark') {
          mainContent.style.filter = 'grayscale(1)';
        } else {
          mainContent.style.filter = 'none';
        }
      } else {
        // Fallback: si pas de main-content, appliquer sur body mais exclure la navbar
        if (savedTheme === 'dark') {
          document.body.style.filter = 'grayscale(1)';
          // Exclure la navbar du filtre
          const navbar = document.querySelector('nav, [role="navigation"]');
          if (navbar) {
            navbar.style.filter = 'none';
          }
        } else {
          document.body.style.filter = 'none';
        }
      }
    }
  }, []);

  return { theme, setTheme };
};
