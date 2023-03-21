import express, { json } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pino from 'pino';

import { initializeKnex } from './database/initilize-knex';
import createDbRepos from '@database';
import {
  routes,
  attachServices,
  errorHandler,
  handleServiceError,
  logRequest,
  validateRequest,
  validateAccessToken,
} from '@api';
import { Environment } from '@common/environment';
import { createTokensService, createAuthService } from './modules';
import { initializeTodoService, initializeUserService } from './modules';

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

  // create services
  const knex = initializeKnex(logger);
  const dbRepositories = createDbRepos(knex);
  const tokensService = createTokensService(env);
  const authService = createAuthService(dbRepositories, tokensService);
  const userService = initializeUserService(dbRepositories);
  const todoService = initializeTodoService(dbRepositories);
  const services = { userService, todoService, authService };

  // create the app
  const app = express();

  // register global middleware
  app.use([
    logRequest(logger),
    helmet(),
    cors(),
    json(),
    compression(),
    attachServices(services),
    validateAccessToken(tokensService),
    handleServiceError(),
    errorHandler(logger),
  ]);

  // register routes
  for (const { method, path, request, middlewares = [], handler } of routes) {
    if (request) {
      middlewares.push(validateRequest(request));
    }

    app[method](path, ...middlewares, handler);
  }

  // define an app tear down function
  const destroy = async () => {
    await knex.destroy();
  };

  return { app, destroy };
}
