// Fonctions utilitaires pour l'application

// Formatage des dates
export const formatDate = (date, locale = 'fr-FR') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale);
};

export const formatDateTime = (date, locale = 'fr-FR') => {
  if (!date) return '';
  return new Date(date).toLocaleString(locale);
};

// Formatage des nombres
export const formatNumber = (number, locale = 'fr-FR') => {
  if (number === null || number === undefined) return '0';
  return new Intl.NumberFormat(locale).format(number);
};

// Validation des emails
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation des numéros de téléphone
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
  return phoneRegex.test(phone);
};

// Génération d'ID unique
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Deep clone d'un objet
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Filtrage d'objets
export const filterObject = (obj, predicate) => {
  return Object.keys(obj)
    .filter(key => predicate(obj[key], key))
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

// Tri d'objets
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];

    // Gestion des valeurs null/undefined
    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';

    // Conversion en string pour la comparaison
    aVal = String(aVal).toLowerCase();
    bVal = String(bVal).toLowerCase();

    if (order === 'desc') {
      return bVal.localeCompare(aVal);
    }
    return aVal.localeCompare(bVal);
  });
};

// Pagination
export const paginate = (array, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return array.slice(startIndex, endIndex);
};

// Recherche dans un tableau
export const searchInArray = (array, searchTerm, fields = []) => {
  if (!searchTerm) return array;

  const term = searchTerm.toLowerCase();

  return array.filter(item => {
    if (fields.length === 0) {
      // Recherche dans toutes les propriétés
      return Object.values(item).some(value =>
        String(value).toLowerCase().includes(term)
      );
    } else {
      // Recherche dans les champs spécifiés
      return fields.some(field => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(term);
      });
    }
  });
};

// Gestion des erreurs
export const handleApiError = (error) => {
  if (error.response) {
    // Erreur de réponse du serveur
    return error.response.data?.message || 'Erreur serveur';
  } else if (error.request) {
    // Erreur de réseau
    return 'Erreur de connexion au serveur';
  } else {
    // Autre erreur
    return error.message || 'Une erreur inattendue est survenue';
  }
};

// Validation des formulaires
export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return value && value.toString().length <= maxLength;
};

// Gestion du localStorage de manière sécurisée
export const storage = {
  get: (key) => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  },

  set: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      }
  },

  remove: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      }
  },

  clear: () => {
    try {
      sessionStorage.clear();
    } catch (error) {
      }
  }
};