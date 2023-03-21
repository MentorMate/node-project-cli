import express from 'express';
import pino from 'pino';

import { initializeKnex } from './database/initilize-knex';
import createDbRepos from '@database';
import apiDefinitionFactory, { asyncHandler } from '@api';
import { initializeMiddlewares, validateRequest } from './api/middleware';
import { Environment } from '@common/environment';
import { createTokensService, createAuthService } from './modules';

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
  const tokensService = createTokensService(env);
  const authService = createAuthService(dbRepositories, tokensService);
  const apiRoutes = apiDefinitionFactory(dbRepositories, authService);

  const app = express();
  app.use(initializeMiddlewares(logger, tokensService));

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
