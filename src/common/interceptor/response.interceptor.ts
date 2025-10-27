import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
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
        let message = 'data fetched';
        if (typeof data === 'object') {
          if (data.responseMessage || 'responseMessage' in data) {
            message = data.responseMessage;
            delete data.responseMessage;
          }
        }
        return {
          code: 'SUCCESS',
          message: message,
          data: data,
        };
      }),
    );
  }
}
