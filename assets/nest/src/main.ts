import helmet from 'helmet';
import * as compression from 'compression';
import { NestFactory } from '@nestjs/core';
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
    compression()
  );

  // setup graceful shutdown
  app.enableShutdownHooks();

  // start server
  await app.listen(process.env.PORT, () => {
    console.log(`App is running on http://localhost:${process.env.PORT}`);
  });
}

bootstrap();
