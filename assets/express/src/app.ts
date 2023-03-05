import express, { Express } from 'express';
import { Logger } from 'pino'

import { dbConnection as mockDB, dbFactory } from '@database';
import { apiDefinitionFactory, ApiRoutes, ApiRoutesDefinition } from '@api';
import { initateMiddlewares, validateRequest } from '@middleware';

export async function init(app: Express, logger: Logger) {
  // await db connection

  const dbLayers = dbFactory(mockDB); // here we'll pass the real DB connection

  const apiRoutes = apiDefinitionFactory(dbLayers);

  const routesPrefixes: Record<keyof ApiRoutesDefinition, string> = {
    healthz: '/v1/healthz',
    users: '/v1/users'
  }

  Object.keys(apiRoutes).forEach((apiModuleKey: keyof ApiRoutesDefinition) => {
    const router = express.Router();

    Object.values(apiRoutes[apiModuleKey]).forEach(
      ({
        method,
        url,
        requestSchema,
        middlewares,
        handler,
      }: ApiRoutes) => {
        if (requestSchema) {
          middlewares.push(validateRequest(requestSchema))
        }

        router[method](url, ...middlewares, handler);
      }
    );

    app.use(routesPrefixes[apiModuleKey], router);
  });

  // Hello world
  app.get('/', (_req, res) => {
    throw new Error('test')
    res.send('Hello world')
  })

  
  app.use(initateMiddlewares(logger))
}
