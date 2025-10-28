import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { LoggerService } from '../../shared/logger-service/logger.service';
import { ERROR_CODES, ERROR_MESSAGE } from './error-code';
import { IErrorResponse } from '../interface/common.interface';

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
    constructor(
        private config: ConfigService,
        private readonly logger: LoggerService,
    ) {}

    catch(exception: T, host: ArgumentsHost): any {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();

        const traceId = `TI${Date.now()}`;

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        const errorResponse: IErrorResponse = {
            code: ERROR_CODES.E_INTERNAL_SERVER_ERROR,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: ERROR_MESSAGE.E_INTERNAL_SERVER_ERROR.message,
            traceId,
            errors: [ERROR_MESSAGE.E_INTERNAL_SERVER_ERROR.message],
        };

        try {
            this.logger.error(`A global error message: ${(exception as Error).message}`);
            console.log(`A global exception occurred. traceId-${traceId}:`, exception);

            if (exception instanceof HttpException) {
                let exceptionResponse: string | Record<string, any> = {};
                exceptionResponse = exception.getResponse();

                errorResponse.statusCode = exception.getStatus();
                errorResponse.message = exception.message;
                errorResponse.code =
                    (typeof exceptionResponse === 'object' && exceptionResponse['errorCode']) || errorResponse.code;
                errorResponse.errors =
                    (typeof exceptionResponse === 'object' && exceptionResponse['errors']) || errorResponse.errors;
            }

            res.status(statusCode).json(errorResponse);
        } catch (errors) {
            this.logger.error(`A global exception occurred traceId-${traceId}: ${errors}`);
            res.status(statusCode).json(errorResponse);
        }
    }
}
