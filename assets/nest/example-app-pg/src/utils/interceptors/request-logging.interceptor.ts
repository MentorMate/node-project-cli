import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';

const REMOVED = '[[REMOVED]]';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private logger = new Logger('RequestLoggingInterceptor');

  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitizedHeaders = { ...headers };

    if (sanitizedHeaders.Authorization) {
      sanitizedHeaders.Authorization = REMOVED;
    }

    if (sanitizedHeaders.Cookie) {
      sanitizedHeaders.Cookie = REMOVED;
    }

    return sanitizedHeaders;
  }

  private sanitizeBody(body: Record<string, any>): Record<string, any> {
    const sanitizedBody = { ...body };

    if (sanitizedBody.password) {
      sanitizedBody.password = REMOVED;
    }

    return sanitizedBody;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timestamp = new Date().toISOString();
    const startTime = process.hrtime();

    const { url, body, method, headers, ip } = context
      .switchToHttp()
      .getRequest();

    return next.handle().pipe(
      tap(() => {
        const endTime = process.hrtime(startTime);
        const duration = endTime[0] * 1000 + endTime[1] / 1000000;
        const logMsg = {
          timestamp,
          duration: `${duration}ms`,
          ip,
          headers: this.sanitizeHeaders(headers),
          method,
          url,
          body: this.sanitizeBody(body),
        };

        this.logger.log(JSON.stringify(logMsg));
      }),
      catchError((err: any) => {
        const endTime = process.hrtime(startTime);
        const duration = endTime[0] * 1000 + endTime[1] / 1000000;
        const logMsg = {
          timestamp,
          duration: `${duration}ms`,
          ip,
          headers: this.sanitizeHeaders(headers),
          method,
          url,
          body: this.sanitizeBody(body),
          err,
        };

        this.logger.log(JSON.stringify(logMsg));
        return throwError(() => err);
      }),
    );
  }
}
