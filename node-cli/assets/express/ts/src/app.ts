import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import helloWorld from './hello-world';

export function create() {
  // create the app
  const app = express();

  // register global middleware
  app.use(
    // add security HTTP headers
    helmet(),
    // enables CORS
    cors(),
    // compresses response bodies
    compression()
  );

  // register a route
  app.get('/', helloWorld);

  return { app };
}
