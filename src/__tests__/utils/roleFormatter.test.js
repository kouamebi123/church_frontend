/**
 * Tests pour le formateur de rôles
 */
import { formatRole, getRoleDisplayName, getRoleColor, getRoleIcon } from '@utils/roleFormatter';

describe('roleFormatter', () => {
  describe('formatRole', () => {
    it('should format SUPER_ADMIN role correctly', () => {
      expect(formatRole('SUPER_ADMIN')).toBe('Super-admin');
    });

    it('should format ADMIN role correctly', () => {
      expect(formatRole('ADMIN')).toBe('Administrateur');
    });

    it('should format MANAGER role correctly', () => {
      expect(formatRole('MANAGER')).toBe('Manager');
    });

    it('should format SUPERVISEUR role correctly', () => {
      expect(formatRole('SUPERVISEUR')).toBe('Superviseur');
    });

    it('should format COLLECTEUR_RESEAUX role correctly', () => {
      expect(formatRole('COLLECTEUR_RESEAUX')).toBe('Collecteur de réseaux');
    });

    it('should format COLLECTEUR_CULTE role correctly', () => {
      expect(formatRole('COLLECTEUR_CULTE')).toBe('Collecteur de culte');
    });

    it('should format MEMBRE role correctly', () => {
      expect(formatRole('MEMBRE')).toBe('Membre');
    });

    it('should handle unknown role', () => {
      expect(formatRole('UNKNOWN_ROLE')).toBe('UNKNOWN_ROLE');
    });

    it('should handle null role', () => {
      expect(formatRole(null)).toBe('-');
    });

    it('should handle undefined role', () => {
      expect(formatRole(undefined)).toBe('-');
    });
  });

  describe('getRoleDisplayName', () => {
    it('should return display name for valid role', () => {
      expect(getRoleDisplayName('ADMIN')).toBe('Administrateur');
    });

    it('should return role for unknown role', () => {
      expect(getRoleDisplayName('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getRoleColor', () => {
    it('should return correct color for SUPER_ADMIN', () => {
      expect(getRoleColor('SUPER_ADMIN')).toBe('error');
    });

    it('should return correct color for ADMIN', () => {
      expect(getRoleColor('ADMIN')).toBe('warning');
    });

    it('should return correct color for MANAGER', () => {
      expect(getRoleColor('MANAGER')).toBe('info');
    });

    it('should return default color for unknown role', () => {
      expect(getRoleColor('UNKNOWN')).toBe('default');
    });
  });

  describe('getRoleIcon', () => {
    it('should return correct icon for SUPER_ADMIN', () => {
      expect(getRoleIcon('SUPER_ADMIN')).toBe('AdminPanelSettingsIcon');
    });

    it('should return correct icon for ADMIN', () => {
      expect(getRoleIcon('ADMIN')).toBe('AdminPanelSettingsIcon');
    });

    it('should return correct icon for MANAGER', () => {
      expect(getRoleIcon('MANAGER')).toBe('ManageAccountsIcon');
    });

    it('should return default icon for unknown role', () => {
      expect(getRoleIcon('UNKNOWN')).toBe('PersonIcon');
    });
  });
});