/**
 * Tests pour le logger centralisé
 */
import { vi } from 'vitest';
import logger from '@utils/logger';

// Mock console pour éviter les logs pendant les tests
const originalConsole = global.console;
beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error message');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      );
    });

    it('should log error with data', () => {
      const errorData = { code: 'TEST_ERROR', details: 'Test details' };
      logger.error('Test error', errorData);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error')
      );
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning message');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Test warning message')
      );
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('Test info message')
      );
    });
  });

  describe('debug', () => {
    it('should log debug messages', () => {
      logger.debug('Test debug message');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Test debug message')
      );
    });
  });

  describe('performance', () => {
    it('should log performance metrics', () => {
      const startTime = performance.now();
      // Simuler une opération qui prend du temps
      setTimeout(() => {
        logger.performance('Test operation', startTime);
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('Test operation completed')
        );
      }, 10);
    });
  });

  describe('group', () => {
    it('should create console groups in debug mode', () => {
      const mockGroup = jest.fn();
      const mockGroupEnd = jest.fn();
      global.console.group = mockGroup;
      global.console.groupEnd = mockGroupEnd;

      logger.group('Test Group', () => {
        logger.debug('Inside group');
      });

      expect(mockGroup).toHaveBeenCalledWith('📁 Test Group');
      expect(mockGroupEnd).toHaveBeenCalled();
    });
  });

  describe('table', () => {
    it('should log data in table format', () => {
      const mockTable = jest.fn();
      global.console.table = mockTable;
      global.console.log = jest.fn();

      const testData = [{ name: 'John', age: 30 }];
      logger.table('Test data', testData);

      expect(console.log).toHaveBeenCalledWith('📊 Test data');
      expect(mockTable).toHaveBeenCalledWith(testData);
    });
  });
});
