import express from 'express';
import pino from 'pino'
import { createHttpTerminator } from 'http-terminator';
import { Environment, envSchema } from '@common';

import { init } from './app';

async function bootstrap() {
  const env: Environment = envSchema.parse(process.env);
  const app = express();
  const logger = pino({
    name: 'http',
    ...(env.NODE_ENV !== 'production' && {
      transport: {
        target: 'pino-pretty',
        colorize: false
      },
    }),
  });

  init(app, logger);

  // Start server
  const server = app.listen(env.PORT, () => {
    console.log(`App is running on http://localhost:${env.PORT}`);
  });

  // Graceful Shutdown
  const httpTerminator = createHttpTerminator({ server });

  const shutdown = async () => {
    console.log('Shutting down...')
    await httpTerminator.terminate();
  };

  const onSignal = (signal: NodeJS.Signals) => {
    console.log(`${signal} received`);
    shutdown();
  };

  process.on('SIGTERM', onSignal);
  process.on('SIGINT', onSignal);
}

bootstrap();
