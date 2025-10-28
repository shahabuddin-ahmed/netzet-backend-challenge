import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES, ERROR_MESSAGE } from './error-code';

export class UnauthorisedException extends HttpException {
    constructor(errorCode: ERROR_CODES, customMessage?: string, errors?: string[]) {
        const message = customMessage || ERROR_MESSAGE[`${errorCode}`].message;
        super(
            {
                errorCode,
                message: message,
                errors: errors ?? [message],
            },
            HttpStatus.UNAUTHORIZED,
        );
    }
}
