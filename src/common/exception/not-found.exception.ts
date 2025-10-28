import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES, ERROR_MESSAGE } from './error-code';

export class NotFoundException extends HttpException {
    constructor(errorCode: ERROR_CODES = ERROR_CODES.E_NOT_FOUND, customMessage?: string, errors?: string[]) {
        const message = customMessage || ERROR_MESSAGE[`${errorCode}`].message;
        super(
            {
                errorCode,
                message,
                errors: errors ?? [message],
            },
            HttpStatus.NOT_FOUND,
        );
    }
}
