/**
 * Tests pour le hook usePermissions
 */

import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import usePermissions from '../usePermissions';

// Mock du store Redux
const createMockStore = (user = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user }, action) => state
    }
  });
};

// Wrapper pour les tests
const createWrapper = (user) => {
  const store = createMockStore(user);
  return ({ children }) => (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

describe('usePermissions', () => {
  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    role: 'ADMIN',
    current_role: 'MANAGER'
  };

  describe('Rôles de base', () => {
    test('devrait retourner les bonnes permissions pour SUPER_ADMIN', () => {
      const user = { ...mockUser, role: 'SUPER_ADMIN' };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isSuperAdmin).toBe(true);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isManager).toBe(true);
      expect(result.current.isSuperviseur).toBe(true);
      expect(result.current.isCollecteurReseaux).toBe(true);
      expect(result.current.isCollecteurCulte).toBe(true);
      expect(result.current.isMembre).toBe(true);
    });

    test('devrait retourner les bonnes permissions pour ADMIN', () => {
      const user = { ...mockUser, role: 'ADMIN' };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isSuperAdmin).toBe(false);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isManager).toBe(true);
      expect(result.current.isSuperviseur).toBe(true);
      expect(result.current.isCollecteurReseaux).toBe(true);
      expect(result.current.isCollecteurCulte).toBe(true);
      expect(result.current.isMembre).toBe(true);
    });

    test('devrait retourner les bonnes permissions pour MANAGER', () => {
      const user = { ...mockUser, role: 'MANAGER' };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isSuperAdmin).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isManager).toBe(true);
      expect(result.current.isSuperviseur).toBe(true);
      expect(result.current.isCollecteurReseaux).toBe(true);
      expect(result.current.isCollecteurCulte).toBe(true);
      expect(result.current.isMembre).toBe(true);
    });

    test('devrait retourner les bonnes permissions pour SUPERVISEUR', () => {
      const user = { ...mockUser, role: 'SUPERVISEUR' };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isSuperAdmin).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isManager).toBe(false);
      expect(result.current.isSuperviseur).toBe(true);
      expect(result.current.isCollecteurReseaux).toBe(true);
      expect(result.current.isCollecteurCulte).toBe(true);
      expect(result.current.isMembre).toBe(true);
    });

    test('devrait retourner les bonnes permissions pour COLLECTEUR_RESEAUX', () => {
      const user = { ...mockUser, role: 'COLLECTEUR_RESEAUX' };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isSuperAdmin).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isManager).toBe(false);
      expect(result.current.isSuperviseur).toBe(false);
      expect(result.current.isCollecteurReseaux).toBe(true);
      expect(result.current.isCollecteurCulte).toBe(false);
      expect(result.current.isMembre).toBe(true);
    });

    test('devrait retourner les bonnes permissions pour COLLECTEUR_CULTE', () => {
      const user = { ...mockUser, role: 'COLLECTEUR_CULTE' };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isSuperAdmin).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isManager).toBe(false);
      expect(result.current.isSuperviseur).toBe(false);
      expect(result.current.isCollecteurReseaux).toBe(false);
      expect(result.current.isCollecteurCulte).toBe(true);
      expect(result.current.isMembre).toBe(true);
    });

    test('devrait retourner les bonnes permissions pour MEMBRE', () => {
      const user = { ...mockUser, role: 'MEMBRE' };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isSuperAdmin).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isManager).toBe(false);
      expect(result.current.isSuperviseur).toBe(false);
      expect(result.current.isCollecteurReseaux).toBe(false);
      expect(result.current.isCollecteurCulte).toBe(false);
      expect(result.current.isMembre).toBe(true);
    });
  });

  describe('Priorité des rôles', () => {
    test('devrait prioriser current_role sur role', () => {
      const user = { 
        ...mockUser, 
        role: 'SUPERVISEUR', 
        current_role: 'ADMIN' 
      };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isSuperviseur).toBe(true);
    });

    test('devrait utiliser role si current_role est null', () => {
      const user = { 
        ...mockUser, 
        role: 'MANAGER', 
        current_role: null 
      };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isManager).toBe(true);
    });

    test('devrait utiliser role si current_role est undefined', () => {
      const user = { 
        ...mockUser, 
        role: 'MANAGER', 
        current_role: undefined 
      };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isManager).toBe(true);
    });
  });

  describe('Cas limites', () => {
    test('devrait gérer un utilisateur sans rôle', () => {
      const user = { ...mockUser, role: null };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isSuperAdmin).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isManager).toBe(false);
      expect(result.current.isSuperviseur).toBe(false);
      expect(result.current.isCollecteurReseaux).toBe(false);
      expect(result.current.isCollecteurCulte).toBe(false);
      expect(result.current.isMembre).toBe(false);
    });

    test('devrait gérer un utilisateur non connecté', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(null)
      });

      expect(result.current.isSuperAdmin).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isManager).toBe(false);
      expect(result.current.isSuperviseur).toBe(false);
      expect(result.current.isCollecteurReseaux).toBe(false);
      expect(result.current.isCollecteurCulte).toBe(false);
      expect(result.current.isMembre).toBe(false);
    });

    test('devrait gérer un rôle invalide', () => {
      const user = { ...mockUser, role: 'INVALID_ROLE' };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isSuperAdmin).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isManager).toBe(false);
      expect(result.current.isSuperviseur).toBe(false);
      expect(result.current.isCollecteurReseaux).toBe(false);
      expect(result.current.isCollecteurCulte).toBe(false);
      expect(result.current.isMembre).toBe(false);
    });
  });

  describe('Propriétés calculées', () => {
    test('devrait calculer isNonAdminRole correctement', () => {
      const user = { ...mockUser, role: 'MANAGER' };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isNonAdminRole).toBe(true);
    });

    test('devrait calculer isNonAdminRole pour SUPERVISEUR', () => {
      const user = { ...mockUser, role: 'SUPERVISEUR' };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isNonAdminRole).toBe(true);
    });

    test('devrait calculer isNonAdminRole pour COLLECTEUR_RESEAUX', () => {
      const user = { ...mockUser, role: 'COLLECTEUR_RESEAUX' };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isNonAdminRole).toBe(true);
    });

    test('devrait calculer isNonAdminRole pour COLLECTEUR_CULTE', () => {
      const user = { ...mockUser, role: 'COLLECTEUR_CULTE' };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isNonAdminRole).toBe(true);
    });

    test('devrait calculer isNonAdminRole pour ADMIN', () => {
      const user = { ...mockUser, role: 'ADMIN' };
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(user)
      });

      expect(result.current.isNonAdminRole).toBe(false);
    });
  });
});
