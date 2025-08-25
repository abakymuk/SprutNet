import { describe, it, expect } from 'vitest';
import { 
  getErrorMessage, 
  getErrorType, 
  getErrorIcon, 
  getErrorColor,
  ERROR_MESSAGES 
} from '../errors/messages';
import { 
  analyzeError, 
  extractErrorCode, 
  shouldShowFallback, 
  shouldRetry,
  createErrorHandler 
} from '../errors/handlers';

describe('Error Messages System', () => {
  describe('getErrorMessage', () => {
    it('should return correct message for 400 error', () => {
      const message = getErrorMessage('400');
      expect(message.title).toBe('Неверный запрос');
      expect(message.message).toBe('Проверьте правильность введенных данных и попробуйте снова.');
      expect(message.action).toBe('Исправить данные');
    });

    it('should return correct message for 404 error', () => {
      const message = getErrorMessage('404');
      expect(message.title).toBe('Данные не найдены');
      expect(message.message).toBe('По вашему запросу ничего не найдено.');
      expect(message.action).toBe('Изменить параметры');
    });

    it('should return correct message for 429 error', () => {
      const message = getErrorMessage('429');
      expect(message.title).toBe('Слишком много запросов');
      expect(message.message).toBe('Превышен лимит запросов к серверу.');
      expect(message.suggestion).toBe('Мы автоматически повторим запрос через несколько секунд.');
    });

    it('should return correct message for 500 error', () => {
      const message = getErrorMessage('500');
      expect(message.title).toBe('Ошибка сервера');
      expect(message.message).toBe('Произошла внутренняя ошибка на сервере.');
      expect(message.action).toBe('Использовать демо-данные');
    });

    it('should return fallback message for unknown error', () => {
      const message = getErrorMessage('999');
      expect(message.title).toBe('Неизвестная ошибка'); // Falls back to UNKNOWN_ERROR
    });

    it('should handle numeric error codes', () => {
      const message = getErrorMessage(404);
      expect(message.title).toBe('Данные не найдены');
    });
  });

  describe('getErrorType', () => {
    it('should identify client errors', () => {
      expect(getErrorType('400')).toBe('validation');
      expect(getErrorType('401')).toBe('client');
      expect(getErrorType('403')).toBe('client');
      expect(getErrorType('404')).toBe('client');
    });

    it('should identify server errors', () => {
      expect(getErrorType('500')).toBe('server');
      expect(getErrorType('502')).toBe('server');
      expect(getErrorType('503')).toBe('server');
      expect(getErrorType('504')).toBe('server');
    });

    it('should identify network errors', () => {
      expect(getErrorType('429')).toBe('network');
      expect(getErrorType('NETWORK_ERROR')).toBe('network');
      expect(getErrorType('TIMEOUT_ERROR')).toBe('network');
    });

    it('should identify validation errors', () => {
      expect(getErrorType('VALIDATION_ERROR')).toBe('validation');
      expect(getErrorType('DATE_RANGE_ERROR')).toBe('validation');
      expect(getErrorType('PORT_SAME_ERROR')).toBe('validation');
    });

    it('should return unknown for unrecognized errors', () => {
      expect(getErrorType('UNKNOWN_ERROR')).toBe('unknown');
    });
  });

  describe('getErrorIcon', () => {
    it('should return correct icons for different error types', () => {
      expect(getErrorIcon('client')).toBe('AlertTriangle');
      expect(getErrorIcon('validation')).toBe('AlertTriangle');
      expect(getErrorIcon('server')).toBe('Server');
      expect(getErrorIcon('network')).toBe('Wifi');
      expect(getErrorIcon('unknown')).toBe('AlertCircle');
    });
  });

  describe('getErrorColor', () => {
    it('should return correct colors for different error types', () => {
      expect(getErrorColor('client')).toBe('text-orange-600');
      expect(getErrorColor('validation')).toBe('text-orange-600');
      expect(getErrorColor('server')).toBe('text-red-600');
      expect(getErrorColor('network')).toBe('text-blue-600');
      expect(getErrorColor('unknown')).toBe('text-gray-600');
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should contain all required error messages', () => {
      const requiredCodes = ['400', '404', '429', '500', 'NETWORK_ERROR', 'VALIDATION_ERROR'];
      
      requiredCodes.forEach(code => {
        expect(ERROR_MESSAGES[code]).toBeDefined();
        expect(ERROR_MESSAGES[code].title).toBeDefined();
        expect(ERROR_MESSAGES[code].message).toBeDefined();
      });
    });

    it('should have consistent message structure', () => {
      Object.values(ERROR_MESSAGES).forEach(message => {
        expect(typeof message.title).toBe('string');
        expect(typeof message.message).toBe('string');
        expect(message.title.length).toBeGreaterThan(0);
        expect(message.message.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Error Handlers', () => {
  describe('extractErrorCode', () => {
    it('should extract code from string', () => {
      expect(extractErrorCode('400')).toBe('400');
      expect(extractErrorCode('NETWORK_ERROR')).toBe('NETWORK_ERROR');
    });

    it('should extract code from number', () => {
      expect(extractErrorCode(404)).toBe(404);
      expect(extractErrorCode(500)).toBe(500);
    });

    it('should extract code from error object with status', () => {
      const error = { status: 429 };
      expect(extractErrorCode(error)).toBe('429');
    });

    it('should extract code from error object with code', () => {
      const error = { code: 'TIMEOUT_ERROR' };
      expect(extractErrorCode(error)).toBe('TIMEOUT_ERROR');
    });

    it('should extract code from axios-like error', () => {
      const error = { 
        response: { 
          status: 500,
          data: { error: 'Internal Server Error' }
        } 
      };
      expect(extractErrorCode(error)).toBe('500');
    });

    it('should extract code from message containing status', () => {
      const error = { message: 'Request failed with status: 404' };
      expect(extractErrorCode(error)).toBe('404');
    });

    it('should identify network errors from message', () => {
      const error = { message: 'network error occurred' };
      expect(extractErrorCode(error)).toBe('NETWORK_ERROR');
    });

    it('should return UNKNOWN_ERROR for unrecognized errors', () => {
      const error = { message: 'Some random error' };
      expect(extractErrorCode(error)).toBe('UNKNOWN_ERROR');
    });
  });

  describe('shouldShowFallback', () => {
    it('should return true for server errors', () => {
      expect(shouldShowFallback({ status: 500 })).toBe(true);
      expect(shouldShowFallback({ status: 502 })).toBe(true);
      expect(shouldShowFallback({ status: 503 })).toBe(true);
    });

    it('should return true for Maersk API errors', () => {
      expect(shouldShowFallback({ code: 'MAERSK_API_ERROR' })).toBe(true);
      expect(shouldShowFallback({ code: 'MAERSK_UNAVAILABLE' })).toBe(true);
    });

    it('should return false for client errors', () => {
      expect(shouldShowFallback({ status: 400 })).toBe(false);
      expect(shouldShowFallback({ status: 404 })).toBe(false);
    });

    it('should return false for network errors', () => {
      expect(shouldShowFallback({ status: 429 })).toBe(false);
      expect(shouldShowFallback({ code: 'NETWORK_ERROR' })).toBe(false);
    });
  });

  describe('shouldRetry', () => {
    it('should return true for network errors', () => {
      expect(shouldRetry({ status: 429 })).toBe(true);
      expect(shouldRetry({ code: 'NETWORK_ERROR' })).toBe(true);
      expect(shouldRetry({ code: 'TIMEOUT_ERROR' })).toBe(true);
    });

    it('should return false for client errors', () => {
      expect(shouldRetry({ status: 400 })).toBe(false);
      expect(shouldRetry({ status: 404 })).toBe(false);
    });

    it('should return false for server errors', () => {
      expect(shouldRetry({ status: 500 })).toBe(false);
      expect(shouldRetry({ status: 502 })).toBe(false);
    });
  });

  describe('analyzeError', () => {
    it('should analyze 400 error correctly', () => {
      const result = analyzeError({ status: 400 });
      expect(result.code).toBe('400');
      expect(result.type).toBe('validation');
      expect(result.shouldRetry).toBe(false);
      expect(result.shouldShowDemo).toBe(false);
      expect(result.shouldShowFixData).toBe(true);
    });

    it('should analyze 429 error correctly', () => {
      const result = analyzeError({ status: 429 });
      expect(result.code).toBe('429');
      expect(result.type).toBe('network');
      expect(result.shouldRetry).toBe(true);
      expect(result.shouldShowDemo).toBe(false);
      expect(result.shouldShowFixData).toBe(false);
    });

    it('should analyze 500 error correctly', () => {
      const result = analyzeError({ status: 500 });
      expect(result.code).toBe('500');
      expect(result.type).toBe('server');
      expect(result.shouldRetry).toBe(false);
      expect(result.shouldShowDemo).toBe(true);
      expect(result.shouldShowFixData).toBe(false);
    });

    it('should handle unknown errors', () => {
      const result = analyzeError({ message: 'Unknown error' });
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.type).toBe('unknown');
      expect(result.shouldRetry).toBe(false);
      expect(result.shouldShowDemo).toBe(false);
      expect(result.shouldShowFixData).toBe(false);
    });
  });

  describe('createErrorHandler', () => {
    it('should create error handler with default options', () => {
      const handler = createErrorHandler();
      expect(handler.handle).toBeDefined();
      expect(handler.analyze).toBeDefined();
      expect(handler.retry).toBeDefined();
    });

    it('should create error handler with custom options', () => {
      const onRetry = () => {};
      const onUseDemo = () => {};
      const handler = createErrorHandler({
        onRetry,
        onUseDemo,
        autoRetry: false,
        retryDelay: 1000,
        maxRetries: 5
      });
      
      expect(handler.handle).toBeDefined();
      expect(handler.analyze).toBeDefined();
      expect(handler.retry).toBeDefined();
    });
  });
});
