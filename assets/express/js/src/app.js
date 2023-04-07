const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const helloWorld = require('./hello-world');

module.exports.create = function () {
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

  return { app };
};
