export class AppError extends Error {
  constructor(code, message, service) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.service = service;
  }
}

export function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function logServiceError(service, code, error) {
  if (__DEV__) {
    const detail = error instanceof Error ? error.name : 'UnknownError';
    console.warn(`[${service}] ${code} (${detail})`);
  }
}
