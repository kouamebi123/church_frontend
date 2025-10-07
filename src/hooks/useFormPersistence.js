import { useState, useEffect, useCallback } from 'react';
import logger from '@utils/logger';


/**
 * Hook pour persister les données des formulaires dans le sessionStorage
 * Évite la perte de données lors des erreurs ou rechargements
 */
export const useFormPersistence = (formKey, initialData = {}) => {
  const [formData, setFormData] = useState(() => {
    // Récupérer les données persistées au démarrage
    try {
      const persisted = sessionStorage.getItem(`form_${formKey}`);
      return persisted ? { ...initialData, ...JSON.parse(persisted) } : initialData;
    } catch (error) {
      // logger.warn('Erreur lors de la récupération des données persistées:', error);
      return initialData;
    }
  });

  // Persister les données à chaque changement
  useEffect(() => {
    try {
      sessionStorage.setItem(`form_${formKey}`, JSON.stringify(formData));
    } catch (error) {
      // logger.warn('Erreur lors de la persistance des données:', error);
    }
  }, [formData, formKey]);

  // Fonction pour mettre à jour les données
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Fonction pour réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setFormData(initialData);
    try {
      sessionStorage.removeItem(`form_${formKey}`);
    } catch (error) {
      // logger.warn('Erreur lors de la suppression des données persistées:', error);
    }
  }, [formKey, initialData]);

  // Fonction pour effacer une partie spécifique
  const clearFormPart = useCallback((keys) => {
    setFormData(prev => {
      const newData = { ...prev };
      keys.forEach(key => delete newData[key]);
      return newData;
    });
  }, []);

  // Fonction pour valider et nettoyer les données avant envoi
  const getCleanData = useCallback(() => {
    // Supprimer les propriétés vides ou undefined
    const cleanData = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        cleanData[key] = value;
      }
    });
    return cleanData;
  }, [formData]);

  return {
    formData,
    updateFormData,
    resetForm,
    clearFormPart,
    getCleanData,
    setFormData
  };
};

/**
 * Hook pour gérer la persistance des sélections (église, réseau, etc.)
 */
export const useSelectionPersistence = (selectionKey, initialSelection = null) => {
  const [selection, setSelection] = useState(() => {
    try {
      const persisted = sessionStorage.getItem(`selection_${selectionKey}`);
      return persisted ? JSON.parse(persisted) : initialSelection;
    } catch (error) {
      // logger.warn('Erreur lors de la récupération de la sélection persistée:', error);
      return initialSelection;
    }
  });

  // Persister la sélection
  useEffect(() => {
    try {
      if (selection) {
        sessionStorage.setItem(`selection_${selectionKey}`, JSON.stringify(selection));
      } else {
        sessionStorage.removeItem(`selection_${selectionKey}`);
      }
    } catch (error) {
      // logger.warn('Erreur lors de la persistance de la sélection:', error);
    }
  }, [selection, selectionKey]);

  const updateSelection = useCallback((newSelection) => {
    setSelection(newSelection);
  }, []);

  const clearSelection = useCallback(() => {
    setSelection(null);
    try {
      sessionStorage.removeItem(`selection_${selectionKey}`);
    } catch (error) {
      // logger.warn('Erreur lors de la suppression de la sélection persistée:', error);
    }
  }, [selectionKey]);

  return {
    selection,
    updateSelection,
    clearSelection
  };
};
