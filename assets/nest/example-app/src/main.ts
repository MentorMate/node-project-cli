import '@database/extensions/knex/register';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import compression from '@fastify/compress';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RequestLoggingInterceptor } from '@utils/interceptors/request-logging.interceptor';
import { ServiceToHttpErrorsInterceptor } from '@utils/interceptors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Environment } from '@utils/environment';
import { ErrorLoggingFilter } from '@utils/error-logging.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // enables CORS
  app.enableCors();

  // add security HTTP headers
  app.register(helmet);

  // compresses response bodies
  app.register(compression);

  // enable validation globally
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // map application level errors to http errors
  app.useGlobalInterceptors(new ServiceToHttpErrorsInterceptor());

  // setup graceful shutdown
  app.enableShutdownHooks();

  const configService = app.get<ConfigService<Environment>>(ConfigService);
  const port = configService.get('PORT');

  if (configService.get('REQUEST_LOGGING')) {
    app.useGlobalInterceptors(new RequestLoggingInterceptor());
  }

  if (configService.get('SWAGGER')) {
    const config = new DocumentBuilder().setTitle('To-Do Example API').build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/swagger', app, document);
  }

  if (configService.get('ERROR_LOGGING')) {
    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ErrorLoggingFilter(httpAdapterHost));
  }

  // start server
  await app.listen(port, () => {
    console.log(`App is running on http://localhost:${port}`);
  });
}

bootstrap();
