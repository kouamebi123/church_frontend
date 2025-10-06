import { useEffect, useState } from 'react';

/**
 * Hook pour synchroniser les composants avec les changements de langue et de thème
 * @returns {number} - Timestamp de la dernière mise à jour pour forcer le re-render
 */
export const useLanguageThemeSync = () => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const handleLanguageOrThemeChange = (event) => {
      // Mettre à jour le timestamp pour forcer le re-render
      setLastUpdate(event.detail.timestamp || Date.now());
    };

    window.addEventListener('languageOrThemeChanged', handleLanguageOrThemeChange);
    
    return () => {
      window.removeEventListener('languageOrThemeChanged', handleLanguageOrThemeChange);
    };
  }, []);

  return lastUpdate;
};
