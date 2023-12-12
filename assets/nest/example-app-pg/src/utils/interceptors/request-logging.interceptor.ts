import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

const REMOVED = '[[REMOVED]]';

const headersToRemove = ['Authorization', 'Cookies'];
const bodyKeysToRemove = ['password'];

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private logger = new Logger('RequestLoggingInterceptor');

  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitizedHeaders = { ...headers };

    headersToRemove.forEach((header) => {
      sanitizedHeaders[header] = REMOVED;
    });

    return sanitizedHeaders;
  }

  private sanitizeBody(body: Record<string, any>): Record<string, any> {
    const sanitizedBody = { ...body };

    bodyKeysToRemove.forEach((key) => {
      sanitizedBody[key] = REMOVED;
    });

    return sanitizedBody;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timestamp = new Date().toISOString();
    const startTime = process.hrtime();

    const { url, body, method, headers, ip } = context
      .switchToHttp()
      .getRequest();

    return next.handle().pipe(
      tap((response) => {
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
          response,
        };

        this.logger.log(JSON.stringify(logMsg));
      }),
    );
  }
}
