import { vi } from 'vitest';
import { handleApiError, getErrorMessage, logError } from '@utils/errorHandler';

describe('errorHandler', () => {
  describe('handleApiError', () => {
    it('should handle 400 error', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad request' }
        }
      };

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Bad request');
    });

    it('should handle 400 error without custom message', () => {
      const error = {
        response: {
          status: 400,
          data: {}
        }
      };

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Données invalides. Veuillez vérifier vos informations.');
    });

    it('should handle 401 error', () => {
      const error = {
        response: {
          status: 401,
          data: {}
        }
      };

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Session expirée. Veuillez vous reconnecter.');
    });

    it('should handle 403 error', () => {
      const error = {
        response: {
          status: 403,
          data: {}
        }
      };

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
    });

    it('should handle 404 error', () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Resource not found' }
        }
      };

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Resource not found');
    });

    it('should handle 404 error without custom message', () => {
      const error = {
        response: {
          status: 404,
          data: {}
        }
      };

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Ressource introuvable.');
    });

    it('should handle 409 error', () => {
      const error = {
        response: {
          status: 409,
          data: { message: 'Conflict' }
        }
      };

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Conflict');
    });

    it('should handle 409 error without custom message', () => {
      const error = {
        response: {
          status: 409,
          data: {}
        }
      };

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Conflit de données. Cette ressource existe déjà.');
    });

    it('should handle 422 error', () => {
      const error = {
        response: {
          status: 422,
          data: { message: 'Validation failed' }
        }
      };

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Validation failed');
    });

    it('should handle 422 error without custom message', () => {
      const error = {
        response: {
          status: 422,
          data: {}
        }
      };

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Données de validation invalides.');
    });

    it('should handle 500 error', () => {
      const error = {
        response: {
          status: 500,
          data: {}
        }
      };

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Erreur serveur interne. Veuillez réessayer plus tard.');
    });

    it('should handle network error', () => {
      const error = {
        request: {},
        message: 'Network Error'
      };

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
    });

    it('should handle generic error', () => {
      const error = {
        message: 'Generic error'
      };

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Generic error');
    });

    it('should handle unknown error', () => {
      const error = {};

      const result = handleApiError(error, 'test context');
      expect(result).toBe('Une erreur inattendue s\'est produite.');
    });
  });

  describe('getErrorMessage', () => {
    it('should return error message for Error object', () => {
      const error = new Error('Test error');
      const result = getErrorMessage(error);
      expect(result).toBe('Test error');
    });

    it('should return error message for string', () => {
      const error = 'String error';
      const result = getErrorMessage(error);
      expect(result).toBe('String error');
    });

    it('should return default message for unknown error', () => {
      const error = {};
      const result = getErrorMessage(error);
      expect(result).toBe('Une erreur inattendue s\'est produite');
    });

    it('should return custom default message', () => {
      const error = {};
      const result = getErrorMessage(error, 'Custom default');
      expect(result).toBe('Custom default');
    });
  });

  describe('logError', () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log error with context', () => {
      const error = new Error('Test error');
      logError(error, 'test context');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erreur [test context]:',
        expect.any(Object)
      );
    });

    it('should log error without context', () => {
      const error = new Error('Test error');
      logError(error);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erreur:',
        expect.any(Object)
      );
    });
  });
});
