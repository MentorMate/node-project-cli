import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private logger = new Logger('RequestLoggingInterceptor');

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
          headers,
          method,
          url,
          body,
          response,
        };

        this.logger.log(JSON.stringify(logMsg));
      }),
    );
  }
}
