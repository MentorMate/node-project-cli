// register extensions as the very first thing in the entry point
import '@extensions/zod/register';
import '@extensions/knex/register';

import { createHttpTerminator } from 'http-terminator';

import { environmentSchema } from '@utils/environment';
import { create as createApp } from './app';

function bootstrap() {
  // validate environment and freeze it
  const env = Object.freeze(environmentSchema.parse(process.env));

  // create the application
  const { app, destroy: destroyApp } = createApp(env);

  // start server
  const server = app.listen(env.PORT, env.HOST, () => {
    console.log(`App is running on http://${env.HOST}:${env.PORT}`);
  });

  // setup graceful shutdown
  const httpTerminator = createHttpTerminator({ server });

  const shutdown = async () => {
    console.log('Shutting down...');

    // process in-progress requests
    await httpTerminator.terminate();

    // then destroy the application
    await destroyApp();
  };

  const onSignal = (signal: NodeJS.Signals) => {
    console.log(`${signal} received`);
    shutdown();
  };

  // attach signal listeners
  process.on('SIGTERM', onSignal);
  process.on('SIGINT', onSignal);
}

bootstrap();
