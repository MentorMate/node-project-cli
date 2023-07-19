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
  private logger = new Logger('LoggingInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { id, url, body, ip, method, headers } = context
      .switchToHttp()
      .getRequest();

    return next
      .handle()
      .pipe(
        tap((response) =>
          this.logger.log(
            `${id} ${method} ${url} ${JSON.stringify(
              body,
            )} ${ip} ${JSON.stringify(headers)} ${JSON.stringify(response)}`,
          ),
        ),
      );
  }
}
