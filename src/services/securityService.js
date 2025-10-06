// Service de sécurité avancé pour le frontend
class SecurityService {
  constructor() {
    this.sanitizers = new Map();
    this.validators = new Map();
    this.setupDefaultSanitizers();
    this.setupDefaultValidators();
  }

  // Configuration des sanitizers par défaut
  setupDefaultSanitizers() {
    // Sanitizer pour les chaînes de caractères
    this.registerSanitizer('string', (value) => {
      if (typeof value !== 'string') return '';
      return value
        .trim()
        .replace(/[<>]/g, '') // Supprimer les balises HTML
        .replace(/javascript:/gi, '') // Supprimer les protocoles dangereux
        .replace(/on\w+=/gi, ''); // Supprimer les événements inline
    });

    // Sanitizer pour les emails
    this.registerSanitizer('email', (value) => {
      const sanitized = this.sanitize('string', value);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(sanitized) ? sanitized : '';
    });

    // Sanitizer pour les URLs
    this.registerSanitizer('url', (value) => {
      const sanitized = this.sanitize('string', value);
      try {
        const url = new URL(sanitized);
        return ['http:', 'https:'].includes(url.protocol) ? sanitized : '';
      } catch {
        return '';
      }
    });

    // Sanitizer pour les nombres
    this.registerSanitizer('number', (value) => {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    });

    // Sanitizer pour les objets
    this.registerSanitizer('object', (value) => {
      if (typeof value !== 'object' || value === null) return {};
      return JSON.parse(JSON.stringify(value)); // Deep clone sécurisé
    });
  }

  // Configuration des validateurs par défaut
  setupDefaultValidators() {
    // Validateur pour les mots de passe
    this.registerValidator('password', (value) => {
      const minLength = 8;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      return {
        isValid: value.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
        errors: [
          value.length < minLength && `Le mot de passe doit contenir au moins ${minLength} caractères`,
          !hasUpperCase && 'Le mot de passe doit contenir au moins une majuscule',
          !hasLowerCase && 'Le mot de passe doit contenir au moins une minuscule',
          !hasNumbers && 'Le mot de passe doit contenir au moins un chiffre',
          !hasSpecialChar && 'Le mot de passe doit contenir au moins un caractère spécial'
        ].filter(Boolean)
      };
    });

    // Validateur pour les emails
    this.registerValidator('email', (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(value),
        errors: emailRegex.test(value) ? [] : ['Format d\'email invalide']
      };
    });

    // Validateur pour les téléphones
    this.registerValidator('phone', (value) => {
      const phoneRegex = /^[+]?[0-9\s\-()]{8,}$/;
      return {
        isValid: phoneRegex.test(value),
        errors: phoneRegex.test(value) ? [] : ['Format de téléphone invalide']
      };
    });
  }

  // Enregistrer un sanitizer personnalisé
  registerSanitizer(type, sanitizer) {
    this.sanitizers.set(type, sanitizer);
  }

  // Enregistrer un validateur personnalisé
  registerValidator(type, validator) {
    this.validators.set(type, validator);
  }

  // Sanitizer une valeur
  sanitize(type, value) {
    const sanitizer = this.sanitizers.get(type);
    if (!sanitizer) {
      return value;
    }
    return sanitizer(value);
  }

  // Valider une valeur
  validate(type, value) {
    const validator = this.validators.get(type);
    if (!validator) {
      return { isValid: true, errors: [] };
    }
    return validator(value);
  }

  // Sanitizer un objet complet
  sanitizeObject(obj, schema) {
    const sanitized = {};
    
    for (const [key, type] of Object.entries(schema)) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = this.sanitize(type, obj[key]);
      }
    }
    
    return sanitized;
  }

  // Valider un objet complet
  validateObject(obj, schema) {
    const errors = {};
    let isValid = true;
    
    for (const [key, type] of Object.entries(schema)) {
      if (obj.hasOwnProperty(key)) {
        const validation = this.validate(type, obj[key]);
        if (!validation.isValid) {
          errors[key] = validation.errors;
          isValid = false;
        }
      }
    }
    
    return { isValid, errors };
  }

  // Protection contre les injections XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Protection contre les injections SQL (pour les requêtes côté client)
  escapeSql(text) {
    return text
      .replace(/'/g, "''")
      .replace(/--/g, '')
      .replace(/;/g, '');
  }

  // Validation des fichiers uploadés
  validateFile(file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB par défaut
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
    } = options;

    const errors = [];

    // Vérifier la taille
    if (file.size > maxSize) {
      errors.push(`Le fichier est trop volumineux. Taille maximale: ${maxSize / 1024 / 1024}MB`);
    }

    // Vérifier le type MIME
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Type de fichier non autorisé. Types autorisés: ${allowedTypes.join(', ')}`);
    }

    // Vérifier l'extension
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`Extension de fichier non autorisée. Extensions autorisées: ${allowedExtensions.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Génération de tokens CSRF
  generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validation des tokens CSRF
  validateCSRFToken(token, storedToken) {
    return token === storedToken;
  }

  // Protection contre les attaques par timing
  constantTimeComparison(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  // Validation des permissions côté client
  validatePermission(user, requiredPermission) {
    if (!user || !(user.current_role || user.role)) return false;
    
    const rolePermissions = {
      'SUPER_ADMIN': ['*'],
      'ADMIN': ['users:read', 'users:write', 'networks:read', 'networks:write'],
      'MANAGER': [
        'users:read', 'users:create', 'users:update', 'users:delete',
        'networks:read', 'networks:create', 'networks:update', 'networks:delete',
        'groups:read', 'groups:create', 'groups:update', 'groups:delete',
        'services:read', 'services:create', 'services:update', 'services:delete',
        'stats:read', 'dashboard:read', 'dashboard:write'
      ],
      'SUPERVISEUR': ['users:read', 'networks:read', 'networks:write'],
      'COLLECTEUR_RESEAUX': ['networks:read', 'networks:write'],
      'COLLECTEUR_CULTE': ['services:read', 'services:write'],
      'MEMBRE': ['profile:read', 'profile:write'],
      'GOUVERNANCE': ['stats:read', 'reports:read']
    };

    const permissions = rolePermissions[user.current_role || user.role] || [];
    return permissions.includes('*') || permissions.includes(requiredPermission);
  }

  // Audit de sécurité
  logSecurityEvent(event, details = {}) {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Envoyer à un service de logging
    // Ici vous pourriez envoyer à un service comme Sentry ou un service de logging personnalisé
  }
}

// Instance singleton
const securityService = new SecurityService();

export default securityService; 