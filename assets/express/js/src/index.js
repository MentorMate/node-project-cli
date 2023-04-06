const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const { createHttpTerminator } = require('http-terminator');
const helloWorld = require('./hello-world');

function bootstrap() {
  // create the app
  const app = express();

  // register global middleware
  app.use(
    // add security HTTP headers
    helmet(),
    // compresses response bodies
    compression()
  );

  // register a route
  app.get('/', helloWorld);

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

  const onSignal = (signal) => {
    console.log(`${signal} received`);
    shutdown();
  };

  // attach signal listeners
  process.on('SIGTERM', onSignal);
  process.on('SIGINT', onSignal);
}

bootstrap();
