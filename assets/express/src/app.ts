import express from 'express';
import pino from 'pino';

import { initializeKnex } from './database/initilize-knex';
import createDbRepos from '@database';
import apiDefinitionFactory from '@api';
import { initializeMiddlewares, validateRequest } from './api/middleware';
import { asyncHandler } from '@common';
import { Environment } from '@common/environment';

export function create(env: Environment) {
  // create a logger
  const logger = pino({
    name: 'http',
    ...(env.NODE_ENV !== 'production' && {
      transport: {
        target: 'pino-pretty',
        colorize: false,
      },
    }),
  });

  const knex = initializeKnex(logger);
  const dbRepositories = createDbRepos(knex);
  const apiRoutes = apiDefinitionFactory(dbRepositories);

  const app = express();
  app.use(initializeMiddlewares(logger));

  for (const {
    method,
    path,
    request,
    synchronous,
    middlewares = [],
    handler,
  } of apiRoutes) {
    if (request) {
      middlewares.push(validateRequest(request));
    }

    const routeHandler = synchronous ? handler : asyncHandler(handler);

    app[method](path, ...middlewares, routeHandler);
  }

  const destroy = async () => {
    await knex.destroy();
  };

  return { app, destroy };
}
