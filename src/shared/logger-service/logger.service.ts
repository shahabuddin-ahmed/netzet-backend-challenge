import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
    error(message: string, trace?: Record<string, any> | string) {
        console.error(message, trace);
    }

    warn(message: string, data?: Record<string, any> | string) {
        console.warn(message, data);
    }

    info(message: string, data?: Record<string, any> | string) {
        console.info(message, data);
    }
}
