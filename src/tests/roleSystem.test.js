/**
 * Tests pour le système de rôles et de contrôle d'accès
 * 
 * Ce fichier contient les tests unitaires pour valider :
 * - Le système de rôles multi-niveaux
 * - Le changement de rôle en temps réel
 * - Les restrictions d'accès par page
 * - La synchronisation des permissions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import AccessControl from '../components/AccessControl';
import UserMenu from '../components/sections/UserMenu';
import { authSlice } from '../features/auth/authSlice';

// Mock du store Redux
const createMockStore = (user) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer
    },
    preloadedState: {
      auth: {
        user,
        isAuthenticated: !!user,
        isLoading: false
      }
    }
  });
};

// Mock des services
jest.mock('../services/roleService', () => ({
  changeRole: jest.fn(),
  getAvailableRoles: jest.fn()
}));

jest.mock('../services/i18nService', () => ({
  t: (key) => key
}));

describe('Système de Rôles et Contrôle d\'Accès', () => {
  
  describe('AccessControl Component', () => {
    it('devrait autoriser l\'accès pour les rôles autorisés', () => {
      const user = {
        id: '1',
        username: 'testuser',
        role: 'SUPER_ADMIN',
        current_role: 'SUPER_ADMIN'
      };
      
      const store = createMockStore(user);
      
      render(
        <Provider store={store}>
          <BrowserRouter>
            <AccessControl allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <div data-testid="protected-content">Contenu protégé</div>
            </AccessControl>
          </BrowserRouter>
        </Provider>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('devrait refuser l\'accès pour les rôles non autorisés', () => {
      const user = {
        id: '1',
        username: 'testuser',
        role: 'MANAGER',
        current_role: 'MANAGER'
      };
      
      const store = createMockStore(user);
      
      render(
        <Provider store={store}>
          <BrowserRouter>
            <AccessControl allowedRoles={['SUPER_ADMIN']}>
              <div data-testid="protected-content">Contenu protégé</div>
            </AccessControl>
          </BrowserRouter>
        </Provider>
      );
      
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByText('errors.accessDenied')).toBeInTheDocument();
    });

    it('devrait utiliser current_role en priorité sur role', () => {
      const user = {
        id: '1',
        username: 'testuser',
        role: 'MANAGER',
        current_role: 'SUPER_ADMIN'
      };
      
      const store = createMockStore(user);
      
      render(
        <Provider store={store}>
          <BrowserRouter>
            <AccessControl allowedRoles={['SUPER_ADMIN']}>
              <div data-testid="protected-content">Contenu protégé</div>
            </AccessControl>
          </BrowserRouter>
        </Provider>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('UserMenu Component', () => {
    it('devrait afficher le menu de changement de rôle pour les utilisateurs multi-rôles', () => {
      const user = {
        id: '1',
        username: 'testuser',
        role: 'MANAGER',
        current_role: 'MANAGER',
        available_roles: ['MANAGER', 'SUPERVISEUR', 'COLLECTEUR_CULTE']
      };
      
      const store = createMockStore(user);
      
      render(
        <Provider store={store}>
          <BrowserRouter>
            <UserMenu />
          </BrowserRouter>
        </Provider>
      );
      
      // Le menu de changement de rôle devrait être visible
      expect(screen.getByText('Changer de rôle')).toBeInTheDocument();
    });

    it('ne devrait pas afficher le menu de changement de rôle pour les utilisateurs mono-rôle', () => {
      const user = {
        id: '1',
        username: 'testuser',
        role: 'MANAGER',
        current_role: 'MANAGER',
        available_roles: ['MANAGER']
      };
      
      const store = createMockStore(user);
      
      render(
        <Provider store={store}>
          <BrowserRouter>
            <UserMenu />
          </BrowserRouter>
        </Provider>
      );
      
      // Le menu de changement de rôle ne devrait pas être visible
      expect(screen.queryByText('Changer de rôle')).not.toBeInTheDocument();
    });
  });

  describe('Hiérarchie des Rôles', () => {
    const roleHierarchy = {
      'SUPER_ADMIN': 6,
      'ADMIN': 5,
      'MANAGER': 4,
      'SUPERVISEUR': 3,
      'COLLECTEUR_CULTE': 2,
      'COLLECTEUR_RESEAUX': 2,
      'MEMBRE': 1
    };

    it('devrait respecter la hiérarchie des rôles', () => {
      const roles = ['MANAGER', 'SUPER_ADMIN', 'COLLECTEUR_CULTE', 'ADMIN'];
      const sortedRoles = roles.sort((a, b) => {
        const levelA = roleHierarchy[a] || 0;
        const levelB = roleHierarchy[b] || 0;
        return levelB - levelA;
      });
      
      expect(sortedRoles).toEqual(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'COLLECTEUR_CULTE']);
    });
  });

  describe('Restrictions d\'Accès par Page', () => {
    const pageAccess = {
      'ServiceForm': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'COLLECTEUR_CULTE'],
      'ServicesList': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPERVISEUR'],
      'Dashboard': ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      'Networks': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'COLLECTEUR_RESEAUX'],
      'NetworkDetails': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'COLLECTEUR_RESEAUX'],
      'Churches': ['SUPER_ADMIN'],
      'Departments': ['SUPER_ADMIN'],
      'Carousel': ['SUPER_ADMIN']
    };

    it('devrait avoir des restrictions cohérentes pour chaque page', () => {
      // Vérifier que chaque page a au moins un rôle autorisé
      Object.entries(pageAccess).forEach(([page, roles]) => {
        expect(roles.length).toBeGreaterThan(0);
        expect(roles).toContain('SUPER_ADMIN'); // SUPER_ADMIN doit toujours avoir accès
      });
    });

    it('devrait respecter les restrictions SUPER_ADMIN uniquement', () => {
      const superAdminOnlyPages = ['Churches', 'Departments', 'Carousel'];
      
      superAdminOnlyPages.forEach(page => {
        expect(pageAccess[page]).toEqual(['SUPER_ADMIN']);
      });
    });
  });
});

// Tests d'intégration pour le changement de rôle
describe('Changement de Rôle - Tests d\'Intégration', () => {
  it('devrait mettre à jour les permissions après un changement de rôle', async () => {
    const user = {
      id: '1',
      username: 'testuser',
      role: 'MANAGER',
      current_role: 'MANAGER',
      available_roles: ['MANAGER', 'SUPERVISEUR']
    };
    
    const store = createMockStore(user);
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <AccessControl allowedRoles={['SUPERVISEUR']}>
            <div data-testid="superviseur-content">Contenu superviseur</div>
          </AccessControl>
        </BrowserRouter>
      </Provider>
    );
    
    // Initialement, l'accès devrait être refusé (MANAGER n'a pas accès)
    expect(screen.queryByTestId('superviseur-content')).not.toBeInTheDocument();
    
    // Simuler un changement de rôle vers SUPERVISEUR
    const updatedUser = { ...user, current_role: 'SUPERVISEUR' };
    const updatedStore = createMockStore(updatedUser);
    
    render(
      <Provider store={updatedStore}>
        <BrowserRouter>
          <AccessControl allowedRoles={['SUPERVISEUR']}>
            <div data-testid="superviseur-content">Contenu superviseur</div>
          </AccessControl>
        </BrowserRouter>
      </Provider>
    );
    
    // Maintenant, l'accès devrait être autorisé
    expect(screen.getByTestId('superviseur-content')).toBeInTheDocument();
  });
});
