import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DuplicateRecordError, RecordNotFoundError } from '@database/errors';

const map = {
  [RecordNotFoundError.name]: NotFoundException,
  [DuplicateRecordError.name]: ConflictException,
};

@Injectable()
export class ServiceToHttpErrorsInterceptor implements NestInterceptor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err: Error) =>
        throwError(() => {
          const klass = map[err.name];
          return klass ? new klass(err.message) : err;
        })
      )
    );
  }
}
