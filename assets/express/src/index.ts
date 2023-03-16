import './extensions/zod/register';
import './extensions/knex/register';

import pino from 'pino';
import { createHttpTerminator } from 'http-terminator';
import { envSchema } from '@common';

import { initApplication } from './app';

async function bootstrap() {
  const env = envSchema.parse(process.env);

  const logger = pino({
    name: 'http',
    ...(env.NODE_ENV !== 'production' && {
      transport: {
        target: 'pino-pretty',
        colorize: false,
      },
    }),
  });

  const { app, knex } = await initApplication(logger);

  // Start server
  const server = app.listen(env.PORT, () => {
    console.log(`App is running on http://localhost:${env.PORT}`);
  });

  // Graceful Shutdown
  const httpTerminator = createHttpTerminator({ server });

  const shutdown = async () => {
    console.log('Shutting down...');
    await httpTerminator.terminate();
    await knex.destroy();
  };

  const onSignal = (signal: NodeJS.Signals) => {
    console.log(`${signal} received`);
    shutdown();
  };

  process.on('SIGTERM', onSignal);
  process.on('SIGINT', onSignal);
}

bootstrap();
