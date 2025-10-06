/**
 * Tests pour le composant UserMenu
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UserMenu from '../sections/UserMenu';

// Mock des services
jest.mock('../../services/roleService', () => ({
  getAvailableRoles: jest.fn(),
  changeRole: jest.fn()
}));

jest.mock('../../services/i18nService', () => ({
  t: jest.fn((key) => key)
}));

// Mock du store Redux
const createMockStore = (user = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user }, action) => state
    }
  });
};

// Mock des hooks
jest.mock('../../hooks/useRoleUpdate', () => ({
  __esModule: true,
  default: () => ({
    updateUserData: jest.fn(),
    isUpdating: false
  })
}));

describe('UserMenu', () => {
  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    pseudo: 'Test User',
    role: 'ADMIN',
    current_role: 'MANAGER',
    available_roles: ['ADMIN', 'MANAGER', 'SUPERVISEUR'],
    eglise_locale: {
      nom: 'Église Test'
    }
  };

  const defaultProps = {
    user: mockUser,
    onLogout: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (props = {}) => {
    const store = createMockStore(mockUser);
    return render(
      <Provider store={store}>
        <UserMenu {...defaultProps} {...props} />
      </Provider>
    );
  };

  describe('Rendu de base', () => {
    test('devrait afficher le pseudo de l\'utilisateur', () => {
      renderWithProvider();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    test('devrait afficher le rôle actuel', () => {
      renderWithProvider();
      expect(screen.getByText('MANAGER')).toBeInTheDocument();
    });

    test('devrait afficher le menu utilisateur', () => {
      renderWithProvider();
      const menuButton = screen.getByRole('button');
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Menu de changement de rôle', () => {
    test('devrait afficher le bouton de changement de rôle', () => {
      renderWithProvider();
      const changeRoleButton = screen.getByText('Changer de rôle');
      expect(changeRoleButton).toBeInTheDocument();
    });

    test('devrait ouvrir le menu des rôles au clic', async () => {
      renderWithProvider();
      
      const changeRoleButton = screen.getByText('Changer de rôle');
      fireEvent.click(changeRoleButton);

      await waitFor(() => {
        expect(screen.getByText('ADMIN')).toBeInTheDocument();
        expect(screen.getByText('MANAGER')).toBeInTheDocument();
        expect(screen.getByText('SUPERVISEUR')).toBeInTheDocument();
      });
    });

    test('devrait fermer le menu des rôles au clic extérieur', async () => {
      renderWithProvider();
      
      const changeRoleButton = screen.getByText('Changer de rôle');
      fireEvent.click(changeRoleButton);

      await waitFor(() => {
        expect(screen.getByText('ADMIN')).toBeInTheDocument();
      });

      // Clic extérieur
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText('ADMIN')).not.toBeInTheDocument();
      });
    });
  });

  describe('Gestion des erreurs', () => {
    test('devrait gérer l\'absence de rôles disponibles', () => {
      const userWithoutRoles = {
        ...mockUser,
        available_roles: []
      };
      
      renderWithProvider({ user: userWithoutRoles });
      
      // Le bouton de changement de rôle ne devrait pas être visible
      expect(screen.queryByText('Changer de rôle')).not.toBeInTheDocument();
    });

    test('devrait gérer un seul rôle disponible', () => {
      const userWithOneRole = {
        ...mockUser,
        available_roles: ['ADMIN']
      };
      
      renderWithProvider({ user: userWithOneRole });
      
      // Le bouton de changement de rôle ne devrait pas être visible
      expect(screen.queryByText('Changer de rôle')).not.toBeInTheDocument();
    });
  });

  describe('Accessibilité', () => {
    test('devrait avoir les attributs ARIA appropriés', () => {
      renderWithProvider();
      
      const menuButton = screen.getByRole('button');
      expect(menuButton).toHaveAttribute('aria-haspopup');
    });

    test('devrait être navigable au clavier', () => {
      renderWithProvider();
      
      const menuButton = screen.getByRole('button');
      menuButton.focus();
      expect(menuButton).toHaveFocus();
    });
  });

  describe('Intégration avec Redux', () => {
    test('devrait utiliser les données du store Redux', () => {
      const customUser = {
        ...mockUser,
        pseudo: 'Custom User',
        role: 'SUPER_ADMIN'
      };
      
      const store = createMockStore(customUser);
      render(
        <Provider store={store}>
          <UserMenu {...defaultProps} user={customUser} />
        </Provider>
      );
      
      expect(screen.getByText('Custom User')).toBeInTheDocument();
    });
  });
});
