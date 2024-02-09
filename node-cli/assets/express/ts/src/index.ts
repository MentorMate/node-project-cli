import { createHttpTerminator } from 'http-terminator';
import { create as createApp } from './app';

function bootstrap() {
  // create the app
  const { app } = createApp();

  // start server
  const server = app.listen(process.env.PORT, () => {
    console.log(`App is running on http://localhost:${process.env.PORT}`);
  });

  // setup graceful shutdown
  const httpTerminator = createHttpTerminator({ server });

  const shutdown = async () => {
    console.log('Shutting down...');

    // process in-progress requests
    await httpTerminator.terminate();
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
