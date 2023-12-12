import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class ErrorLoggingFilter implements ExceptionFilter {
  public logger = new Logger('ErrorLoggingFilter');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      const error = exception.getResponse();
      this.logger.error(JSON.stringify(error));

      return httpAdapter.reply(ctx.getResponse(), error, httpStatus);
    }

    this.logger.error(exception);

    return httpAdapter.reply(ctx.getResponse(), exception, httpStatus);
  }
}
