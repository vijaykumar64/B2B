export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE: 'DUPLICATE',
  RATE_LIMITED: 'RATE_LIMITED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  AI_UNAVAILABLE: 'AI_UNAVAILABLE',
  INTERNAL: 'INTERNAL_ERROR',
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCodeType;
  public readonly isOperational = true;

  constructor(message: string, statusCode: number, code: ErrorCodeType) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(resource = 'Resource') {
    return new AppError(`${resource} not found`, 404, ErrorCode.NOT_FOUND);
  }

  static unauthorized(message = 'Not authorized') {
    return new AppError(message, 401, ErrorCode.UNAUTHORIZED);
  }

  static forbidden(message = 'Access denied') {
    return new AppError(message, 403, ErrorCode.FORBIDDEN);
  }

  static validation(message: string) {
    return new AppError(message, 400, ErrorCode.VALIDATION_ERROR);
  }

  static duplicate(message = 'Duplicate value — this record already exists') {
    return new AppError(message, 409, ErrorCode.DUPLICATE);
  }
}
