
// Enum for error categories
export enum ErrorCategory {
  Network = 'NETWORK',
  Authentication = 'AUTHENTICATION',
  Authorization = 'AUTHORIZATION',
  Validation = 'VALIDATION',
  NotFound = 'NOT_FOUND',
  Server = 'SERVER',
  Client = 'CLIENT',
  Unknown = 'UNKNOWN'
}

// Base AppError class
export class AppError extends Error {
  public readonly category: ErrorCategory;
  public readonly statusCode?: number;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    category: ErrorCategory = ErrorCategory.Unknown,
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.category = category;
    this.statusCode = statusCode;
    this.context = context;
    
    // Ensures proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      statusCode: this.statusCode,
      context: this.context,
    };
  }

  public getUserFriendlyMessage(): string {
    switch (this.category) {
      case ErrorCategory.Network:
        return 'Network error: Please check your connection and try again.';
      case ErrorCategory.Authentication:
        return 'Authentication error: Please sign in again.';
      case ErrorCategory.Authorization:
        return 'Authorization error: You don\'t have permission to perform this action.';
      case ErrorCategory.Validation:
        return 'Validation error: Please check your input and try again.';
      case ErrorCategory.NotFound:
        return 'Not found: The requested resource could not be found.';
      case ErrorCategory.Server:
        return 'Server error: Something went wrong on our end. Please try again later.';
      default:
        return this.message || 'An error occurred. Please try again.';
    }
  }
}

// Specific error types
export class NetworkError extends AppError {
  constructor(
    message = 'Network error occurred',
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(message, ErrorCategory.Network, statusCode, context);
    this.name = 'NetworkError';
    
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(
    message = 'Authentication error occurred',
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(message, ErrorCategory.Authentication, statusCode, context);
    this.name = 'AuthenticationError';
    
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message = 'Authorization error occurred',
    statusCode?: number,
    context?: Record<string, any>
  ) {
    super(message, ErrorCategory.Authorization, statusCode, context);
    this.name = 'AuthorizationError';
    
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = 'Validation error occurred',
    context?: Record<string, any>
  ) {
    super(message, ErrorCategory.Validation, 400, context);
    this.name = 'ValidationError';
    
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message = 'Resource not found',
    context?: Record<string, any>
  ) {
    super(message, ErrorCategory.NotFound, 404, context);
    this.name = 'NotFoundError';
    
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ServerError extends AppError {
  constructor(
    message = 'Server error occurred',
    statusCode = 500,
    context?: Record<string, any>
  ) {
    super(message, ErrorCategory.Server, statusCode, context);
    this.name = 'ServerError';
    
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

// Helper function to handle and transform errors from various sources
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  // Handle supabase auth errors
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const err = error as { code: string; message: string; status?: number };
    
    if (err.code.startsWith('auth/')) {
      return new AuthenticationError(err.message, err.status);
    }
    
    if (err.status === 401 || err.status === 403) {
      return new AuthorizationError(err.message, err.status);
    }
    
    if (err.status === 404) {
      return new NotFoundError(err.message);
    }
    
    if (err.status && err.status >= 500) {
      return new ServerError(err.message, err.status);
    }
  }
  
  // Handle network errors
  if (error instanceof TypeError && error.message.includes('network')) {
    return new NetworkError(error.message);
  }
  
  // Handle regular Error objects
  if (error instanceof Error) {
    return new AppError(error.message);
  }
  
  // Handle everything else
  return new AppError(
    typeof error === 'string' 
      ? error 
      : 'An unknown error occurred'
  );
}
