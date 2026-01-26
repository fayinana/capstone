
import { describe, it, expect } from 'vitest';
import { 
  AppError, 
  NetworkError, 
  AuthenticationError, 
  ValidationError,
  NotFoundError,
  ServerError,
  handleError,
  ErrorCategory
} from './errors';

describe('Error Utilities', () => {
  describe('AppError', () => {
    it('creates a basic AppError with default values', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.category).toBe(ErrorCategory.Unknown);
      expect(error.name).toBe('AppError');
    });

    it('creates an AppError with custom values', () => {
      const error = new AppError(
        'Custom error',
        ErrorCategory.Validation,
        400,
        { field: 'email' }
      );
      expect(error.message).toBe('Custom error');
      expect(error.category).toBe(ErrorCategory.Validation);
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({ field: 'email' });
    });

    it('generates user-friendly messages', () => {
      const networkError = new AppError('Test', ErrorCategory.Network);
      expect(networkError.getUserFriendlyMessage()).toContain('Network error');
      
      const authError = new AppError('Test', ErrorCategory.Authentication);
      expect(authError.getUserFriendlyMessage()).toContain('Authentication error');
    });
  });

  describe('Specific error types', () => {
    it('creates a NetworkError', () => {
      const error = new NetworkError('Failed to fetch');
      expect(error.message).toBe('Failed to fetch');
      expect(error.category).toBe(ErrorCategory.Network);
      expect(error.name).toBe('NetworkError');
    });

    it('creates an AuthenticationError', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error.message).toBe('Invalid credentials');
      expect(error.category).toBe(ErrorCategory.Authentication);
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('handleError function', () => {
    it('handles AppError instances directly', () => {
      const originalError = new ValidationError('Invalid input');
      const handledError = handleError(originalError);
      expect(handledError).toBe(originalError);
    });

    it('transforms standard Error to AppError', () => {
      const originalError = new Error('Standard error');
      const handledError = handleError(originalError);
      expect(handledError).toBeInstanceOf(AppError);
      expect(handledError.message).toBe('Standard error');
    });

    it('handles auth errors', () => {
      const authError = { 
        code: 'auth/invalid-email',
        message: 'Invalid email format',
        status: 400
      };
      const handledError = handleError(authError);
      expect(handledError).toBeInstanceOf(AuthenticationError);
      expect(handledError.message).toBe('Invalid email format');
    });

    it('handles network errors', () => {
      const networkError = new TypeError('Failed to fetch: network error');
      const handledError = handleError(networkError);
      expect(handledError).toBeInstanceOf(NetworkError);
    });

    it('handles string errors', () => {
      const handledError = handleError('Something went wrong');
      expect(handledError).toBeInstanceOf(AppError);
      expect(handledError.message).toBe('Something went wrong');
    });
  });
});
