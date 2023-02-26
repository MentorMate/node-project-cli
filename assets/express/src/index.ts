import express from 'express';
import { createHttpTerminator } from 'http-terminator';
import { Environment, envSchema } from './common';

import { init } from './app';

const env: Environment = envSchema.parse(process.env);
const app = express();

init(app);

// Start server
const server = app.listen(env.PORT, () => {
  console.log(`App is running on http://localhost:${env.PORT}`);
});

// Graceful Shutdown
const httpTerminator = createHttpTerminator({ server });

const shutdown = async () => {
  console.log('Shutting down...');
  await httpTerminator.terminate();
};

const onSignal = (signal: NodeJS.Signals) => {
  console.log(`${signal} received`);
  shutdown();
};

process.on('SIGTERM', onSignal);
process.on('SIGINT', onSignal);

// DO NOT: listen to uncaughtException: https://expressjs.com/en/advanced/best-practice-performance.html#what-not-to-do
const onUncaughtException: NodeJS.UncaughtExceptionListener = (error) => {
  console.error('uncaughtException', error);
  shutdown();
};

const onUnhandledRejectionn: NodeJS.UnhandledRejectionListener = (reason) => {
  console.error('unhandledRejection', reason);
  shutdown();
};

process.on('uncaughtException', onUncaughtException);
process.on('unhandledRejection', onUnhandledRejectionn);
