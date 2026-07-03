import { AxiosError } from 'axios';

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface ParsedError {
  statusCode: number;
  message: string;
  isValidationError: boolean;
  isAuthError: boolean;
  isSuspended: boolean;
  isRateLimited: boolean;
  isServerError: boolean;
  isNotFound: boolean;
  isConflict: boolean;
}

const SUSPENDED_KEYWORDS = ['suspendida', 'suspendido', 'suspended'];

export function parseApiError(error: unknown): ParsedError {
  if (error instanceof AxiosError && error.response?.data) {
    const apiError = error.response.data as ApiError;
    const message = Array.isArray(apiError.message)
      ? apiError.message.join('. ')
      : apiError.message || error.message;

    return {
      statusCode: apiError.statusCode,
      message,
      isValidationError: apiError.statusCode === 400,
      isAuthError: apiError.statusCode === 401 &&
        !SUSPENDED_KEYWORDS.some((kw) => message.toLowerCase().includes(kw)),
      isSuspended: apiError.statusCode === 401 &&
        SUSPENDED_KEYWORDS.some((kw) => message.toLowerCase().includes(kw)),
      isRateLimited: apiError.statusCode === 429,
      isServerError: apiError.statusCode >= 500,
      isNotFound: apiError.statusCode === 404,
      isConflict: apiError.statusCode === 409,
    };
  }

  if (error instanceof AxiosError && !error.response) {
    return {
      statusCode: 0,
      message: 'Error de conexión. Verifica tu conexión a internet.',
      isValidationError: false,
      isAuthError: false,
      isSuspended: false,
      isRateLimited: false,
      isServerError: false,
      isNotFound: false,
      isConflict: false,
    };
  }

  return {
    statusCode: 0,
    message: error instanceof Error ? error.message : 'Error inesperado',
    isValidationError: false,
    isAuthError: false,
    isSuspended: false,
    isRateLimited: false,
    isServerError: true,
    isNotFound: false,
    isConflict: false,
  };
}
