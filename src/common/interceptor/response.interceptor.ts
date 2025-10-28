import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  response: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        data = data ? data : {};
        let message = 'Data fetched successfully';
        let statusCode = 200;
        if (typeof data === 'object') {
          if (data.responseMessage || 'responseMessage' in data) {
            message = data.responseMessage;
            delete data.responseMessage;
          }

          if (data.statusCode || 'statusCode' in data) {
            statusCode = data.statusCode;
            delete data.statusCode;
          }
        }
        return {
          code: 'SUCCESS',
          statusCode: statusCode,
          message: message,
          response: data,
        };
      }),
    );
  }
}
