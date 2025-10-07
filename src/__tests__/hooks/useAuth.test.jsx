import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAuth } from '@hooks/useAuth';
import authReducer from '@features/auth/authSlice';

// Mock du store Redux
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        ...initialState
      }
    }
  });
};

// Wrapper pour les tests avec Provider
const createWrapper = (store) => {
  return ({ children }) => (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

describe('useAuth', () => {
  let store;

  beforeEach(() => {
    store = createMockStore();
  });

  it('should return initial auth state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store)
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return authenticated user state', () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'ADMIN'
    };

    store = createMockStore({
      user: mockUser,
      token: 'mock-token',
      isAuthenticated: true
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store)
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('mock-token');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should return loading state', () => {
    store = createMockStore({
      isLoading: true
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store)
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should return error state', () => {
    const mockError = 'Authentication failed';

    store = createMockStore({
      error: mockError
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store)
    });

    expect(result.current.error).toBe(mockError);
  });

  it('should have login function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store)
    });

    expect(typeof result.current.loginUser).toBe('function');
  });

  it('should have register function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store)
    });

    expect(typeof result.current.registerUser).toBe('function');
  });

  it('should have logout function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store)
    });

    expect(typeof result.current.logoutUser).toBe('function');
  });

  it('should have getUserProfile function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store)
    });

    expect(typeof result.current.getUserProfile).toBe('function');
  });

  it('should have updateUserProfile function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store)
    });

    expect(typeof result.current.updateUserProfile).toBe('function');
  });

  it('should have updatePassword function', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(store)
    });

    expect(typeof result.current.updatePassword).toBe('function');
  });
});
