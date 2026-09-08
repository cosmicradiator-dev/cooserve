import { ZodError } from 'zod';
import { apiError } from './apiResponse';
import { logger } from '../logger';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized: Insufficient permissions') {
    super(message, 403, 'UNAUTHORIZED');
  }
}

export class AuthenticationRequiredError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHENTICATED');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict detected') {
    super(message, 409, 'CONFLICT');
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    logger.warn({ msg: 'Zod validation failure', error: message });
    return apiError('VALIDATION_ERROR', message, 400);
  }

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error({ msg: error.message, code: error.code, stack: error.stack });
    } else {
      logger.warn({ msg: error.message, code: error.code });
    }
    return apiError(error.code, error.message, error.statusCode);
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  logger.error({ msg: 'Unhandled error in API route', error: message });
  return apiError('INTERNAL_SERVER_ERROR', message, 500);
}

