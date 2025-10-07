/**
 * Tests pour le composant AccessControl
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AccessControl from '../AccessControl';

// Mock du store Redux
const createMockStore = (user = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user }, action) => state
    }
  });
};

describe('AccessControl', () => {
  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    role: 'ADMIN',
    current_role: 'MANAGER'
  };

  const defaultProps = {
    allowedRoles: ['ADMIN', 'MANAGER'],
    children: <div data-testid="protected-content">Contenu protégé</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (user = mockUser, props = {}) => {
    const store = createMockStore(user);
    return render(
      <Provider store={store}>
        <AccessControl {...defaultProps} {...props} />
      </Provider>
    );
  };

  describe('Accès autorisé', () => {
    test('devrait afficher le contenu pour un rôle autorisé (rôle principal)', () => {
      renderWithProvider({ ...mockUser, role: 'ADMIN' });
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByText('Accès refusé')).not.toBeInTheDocument();
    });

    test('devrait afficher le contenu pour un rôle autorisé (rôle actuel)', () => {
      renderWithProvider({ ...mockUser, current_role: 'MANAGER' });
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByText('Accès refusé')).not.toBeInTheDocument();
    });

    test('devrait afficher le contenu pour SUPER_ADMIN', () => {
      renderWithProvider({ ...mockUser, role: 'SUPER_ADMIN' });
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Accès refusé', () => {
    test('devrait afficher un message d\'accès refusé pour un rôle non autorisé', () => {
      renderWithProvider({ ...mockUser, role: 'SUPERVISEUR' });
      
      expect(screen.getByText('Accès refusé')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    test('devrait afficher un message d\'accès refusé pour MEMBRE', () => {
      renderWithProvider({ ...mockUser, role: 'MEMBRE' });
      
      expect(screen.getByText('Accès refusé')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    test('devrait afficher un lien vers la page d\'accueil', () => {
      renderWithProvider({ ...mockUser, role: 'SUPERVISEUR' });
      
      const homeLink = screen.getByText('Retour à l\'accueil');
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('Gestion des cas limites', () => {
    test('devrait gérer un utilisateur sans rôle', () => {
      renderWithProvider({ ...mockUser, role: null });
      
      expect(screen.getByText('Accès refusé')).toBeInTheDocument();
    });

    test('devrait gérer un utilisateur non connecté', () => {
      renderWithProvider(null);
      
      expect(screen.getByText('Accès refusé')).toBeInTheDocument();
    });

    test('devrait gérer un tableau de rôles vide', () => {
      renderWithProvider(mockUser, { allowedRoles: [] });
      
      expect(screen.getByText('Accès refusé')).toBeInTheDocument();
    });
  });

  describe('Priorité des rôles', () => {
    test('devrait prioriser current_role sur role', () => {
      renderWithProvider({ 
        ...mockUser, 
        role: 'SUPERVISEUR', 
        current_role: 'ADMIN' 
      });
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    test('devrait utiliser role si current_role est null', () => {
      renderWithProvider({ 
        ...mockUser, 
        role: 'ADMIN', 
        current_role: null 
      });
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Rôles multiples', () => {
    test('devrait autoriser l\'accès si l\'utilisateur a au moins un rôle autorisé', () => {
      renderWithProvider({ 
        ...mockUser, 
        role: 'COLLECTEUR_CULTE',
        current_role: 'MANAGER'
      });
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    test('devrait refuser l\'accès si aucun rôle n\'est autorisé', () => {
      renderWithProvider({ 
        ...mockUser, 
        role: 'COLLECTEUR_CULTE',
        current_role: 'COLLECTEUR_RESEAUX'
      });
      
      expect(screen.getByText('Accès refusé')).toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    test('devrait avoir un message d\'erreur accessible', () => {
      renderWithProvider({ ...mockUser, role: 'SUPERVISEUR' });
      
      const errorMessage = screen.getByText('Accès refusé');
      expect(errorMessage).toBeInTheDocument();
    });

    test('devrait avoir un lien accessible', () => {
      renderWithProvider({ ...mockUser, role: 'SUPERVISEUR' });
      
      const homeLink = screen.getByText('Retour à l\'accueil');
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });
});
