import '@database/extensions/knex/register';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import compression from '@fastify/compress';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ServiceToHttpErrorsInterceptor } from '@utils/interceptors';
import { QueryParamsToJsonParser } from '@utils/interceptors/query-params-to-json-parser.interceptor';

async function bootstrap() {
  // create the app
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // register global middleware

  // enables CORS
  app.enableCors();

  // add security HTTP headers
  app.register(helmet);

  // compresses response bodies
  app.register(compression);

  // enable validation globally
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // map application level errors to http errors
  app.useGlobalInterceptors(
    new ServiceToHttpErrorsInterceptor(),
    new QueryParamsToJsonParser(),
  );

  // setup graceful shutdown
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  // start server
  await app.listen(port, () => {
    console.log(`App is running on http://localhost:${port}`);
  });
}

bootstrap();
