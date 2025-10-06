import { formatRole, formatRoleWithFallback } from '../roleFormatter';

// Mock du service i18n
jest.mock('../../services/i18nService', () => ({
  t: (key) => {
    const translations = {
      'common.roles.SUPER_ADMIN': 'Super-admin',
      'common.roles.ADMIN': 'Administrateur',
      'common.roles.MANAGER': 'Manager',
      'common.roles.SUPERVISEUR': 'Superviseur',
      'common.roles.COLLECTEUR_RESEAUX': 'Collecteur de réseaux',
      'common.roles.COLLECTEUR_CULTE': 'Collecteur de culte',
      'common.roles.MEMBRE': 'Membre'
    };
    return translations[key] || key;
  }
}));

describe('roleFormatter', () => {
  describe('formatRole', () => {
    it('devrait formater SUPER_ADMIN en Super-admin', () => {
      expect(formatRole('SUPER_ADMIN')).toBe('Super-admin');
    });

    it('devrait formater ADMIN en Administrateur', () => {
      expect(formatRole('ADMIN')).toBe('Administrateur');
    });

    it('devrait formater MANAGER en Manager', () => {
      expect(formatRole('MANAGER')).toBe('Manager');
    });

    it('devrait formater SUPERVISEUR en Superviseur', () => {
      expect(formatRole('SUPERVISEUR')).toBe('Superviseur');
    });

    it('devrait formater COLLECTEUR_RESEAUX en Collecteur de réseaux', () => {
      expect(formatRole('COLLECTEUR_RESEAUX')).toBe('Collecteur de réseaux');
    });

    it('devrait formater COLLECTEUR_CULTE en Collecteur de culte', () => {
      expect(formatRole('COLLECTEUR_CULTE')).toBe('Collecteur de culte');
    });

    it('devrait formater MEMBRE en Membre', () => {
      expect(formatRole('MEMBRE')).toBe('Membre');
    });

    it('devrait retourner le rôle original si la traduction n\'existe pas', () => {
      expect(formatRole('UNKNOWN_ROLE')).toBe('UNKNOWN_ROLE');
    });

    it('devrait retourner "-" si le rôle est vide', () => {
      expect(formatRole('')).toBe('-');
    });

    it('devrait retourner "-" si le rôle est null', () => {
      expect(formatRole(null)).toBe('-');
    });

    it('devrait retourner "-" si le rôle est undefined', () => {
      expect(formatRole(undefined)).toBe('-');
    });
  });

  describe('formatRoleWithFallback', () => {
    it('devrait formater le rôle avec le fallback par défaut', () => {
      expect(formatRoleWithFallback('SUPER_ADMIN')).toBe('Super-admin');
    });

    it('devrait utiliser le fallback personnalisé', () => {
      expect(formatRoleWithFallback('', 'Non défini')).toBe('Non défini');
    });

    it('devrait utiliser le fallback par défaut "-"', () => {
      expect(formatRoleWithFallback(null)).toBe('-');
    });
  });
});
