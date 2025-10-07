// Mock d'axios
jest.mock('axios');
import axios from 'axios';
import authService from '@services/authService';

const mockAxios = axios.create();

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          token: 'mock-token',
          user: { id: '1', username: 'testuser' }
        }
      };

      mockAxios.post = jest.fn().mockResolvedValue(mockResponse);

      const credentials = { pseudo: 'testuser', password: 'password' };
      const result = await authService.login(credentials);

      expect(result).toEqual(mockResponse.data);
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
    });

    it('should handle login error', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      };

      mockAxios.post = jest.fn().mockRejectedValue(mockError);

      const credentials = { pseudo: 'testuser', password: 'wrongpassword' };
      
      await expect(authService.login(credentials)).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          token: 'mock-token',
          user: { id: '1', username: 'newuser' }
        }
      };

      mockAxios.post = jest.fn().mockResolvedValue(mockResponse);

      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password'
      };

      const result = await authService.register(userData);

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle registration error', async () => {
      const mockError = {
        response: {
          status: 409,
          data: { message: 'User already exists' }
        }
      };

      mockAxios.post = jest.fn().mockRejectedValue(mockError);

      const userData = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password'
      };

      await expect(authService.register(userData)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockResponse = {
        data: { success: true }
      };

      mockAxios.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await authService.logout();

      expect(result).toEqual(mockResponse.data);
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('getMe', () => {
    it('should get user profile successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          user: { id: '1', username: 'testuser', email: 'test@example.com' }
        }
      };

      mockAxios.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await authService.getMe();

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          user: { id: '1', username: 'updateduser', email: 'updated@example.com' }
        }
      };

      mockAxios.put = jest.fn().mockResolvedValue(mockResponse);

      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      const result = await authService.updateProfile(updateData);

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const mockResponse = {
        data: { success: true }
      };

      mockAxios.put = jest.fn().mockResolvedValue(mockResponse);

      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword'
      };

      const result = await authService.updatePassword(passwordData);

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email successfully', async () => {
      const mockResponse = {
        data: { success: true, message: 'Email sent' }
      };

      mockAxios.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await authService.forgotPassword('test@example.com');

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockResponse = {
        data: { success: true, message: 'Password reset successfully' }
      };

      mockAxios.post = jest.fn().mockResolvedValue(mockResponse);

      const resetData = {
        token: 'reset-token',
        newPassword: 'newpassword'
      };

      const result = await authService.resetPassword(resetData);

      expect(result).toEqual(mockResponse.data);
    });
  });
});
