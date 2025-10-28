export enum ERROR_CODES {
    E_UNAUTHORIZED = 'E_UNAUTHORIZED',
    E_FORBIDDEN = 'E_FORBIDDEN',
    E_INVALID_DATA = 'E_INVALID_DATA',
    E_VALIDATION_FAILED = 'E_VALIDATION_FAILED',
    E_SESSION_EXPIRED = 'E_SESSION_EXPIRED',
    E_BAD_REQUEST = 'E_BAD_REQUEST',
    E_NOT_FOUND = 'E_NOT_FOUND',
    E_INTERNAL_SERVER_ERROR = 'E_INTERNAL_SERVER_ERROR',
}

export const ERROR_MESSAGE: Record<ERROR_CODES, { message: string }> = {
    E_UNAUTHORIZED: {
        message: 'Invalid user/api token',
    },
    E_FORBIDDEN: {
        message: 'You are not authorized to access this resource',
    },
    E_INVALID_DATA: {
        message: 'Please provide valid data',
    },
    E_VALIDATION_FAILED: {
        message: 'Please fill up required all fields and valid data',
    },
    E_SESSION_EXPIRED: {
        message: 'Your session is expired',
    },
    E_BAD_REQUEST: {
        message: 'Bad request',
    },
    E_NOT_FOUND: {
        message: 'Resource not found',
    },
    E_INTERNAL_SERVER_ERROR: {
        message: 'Internal Server Error',
    },
};
