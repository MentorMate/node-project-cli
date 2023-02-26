import express, { Express } from 'express';

import { mockDB } from '@database/config/database-config';
import { dbFactory } from '@database/models';
import { apiDefinitionFactory } from './api';
import { middlewareFactory } from './middleware';
import { UserController } from '@api-v1/user/interfaces';

export async function init(app: Express) {
  // await db connection

  const dbLayers = dbFactory(mockDB); // here we'll pass the real DB connection
  const middlewares = middlewareFactory(app);

  const { users } = apiDefinitionFactory(dbLayers, middlewares);
  const userRoutes = express.Router();

  Object.values(users).forEach(
    ({
      method,
      url,
      middlewares,
      handler,
    }: UserController[keyof UserController]) => {
      userRoutes[method](url, ...middlewares, handler);
    }
  );

  app.use('/users', userRoutes);

  // Healthchecks
  app.get('/healthz/live', (_req, res) => {
    res.send('OK')
  })
  app.get('/healthz/ready', (_req, res) => {
    res.send('OK')
  })

  // Hello world
  app.get('/', (_req, res) => {
    res.send('Hello, World')
  })
}
