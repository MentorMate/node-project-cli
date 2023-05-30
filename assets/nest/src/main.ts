import helmet from 'helmet';
import * as compression from 'compression';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  // create the app
  const app = await NestFactory.create(AppModule);

  // register global middleware
  // enables CORS
  app.enableCors();
  app.use(
    // add security HTTP headers
    helmet(),
    // compresses response bodies
    compression(),
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
