import { ArgumentMetadata, ValidationError, ValidationPipe } from '@nestjs/common';
import { ERROR_CODES } from '../exception/error-code';
import { ValidationException } from '../exception/validation.exception';

export class FormHandlerValidationPipe extends ValidationPipe {
    private arrayOfErrors: any[] = [];

    public async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        this.arrayOfErrors = [];
        return await super.transform(value, metadata);
    }

    catchChildError = (errors: ValidationError[]) => {
        for (const error of errors) {
            if (error.constraints) {
                const constaintsMessages = Object.values(error.constraints);
                console.log('', constaintsMessages);
                for (const message of constaintsMessages) {
                    this.arrayOfErrors.push(message);
                }
            } else if (error.children && error.children.length) {
                this.exceptionFactory(error.children);
            }
        }
        return;
    };
    exceptionFactory = (errors: ValidationError[]) => {
        this.catchChildError(errors);
        return new ValidationException(ERROR_CODES.E_VALIDATION_FAILED, undefined, this.arrayOfErrors);
    };
}
