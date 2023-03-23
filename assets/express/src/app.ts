import express, { json } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pino from 'pino';

import {
  onInit as initDatabase,
  create as createDbClient,
  destroy as destroyDbClient,
  TodosRepository,
  UsersRepository,
} from '@modules/database';
import {
  routes,
  errorHandler,
  handleServiceError,
  logRequest,
  validateRequest,
  attachServices,
  validateAccessToken,
  handleUnauthorizedError,
} from '@api';
import { Environment } from '@common/environment';
import {
  createJwtService,
  createAuthService,
  Services,
  createPasswordService,
  createTodoService,
} from '@modules';

export function create(env: Environment) {
  // init modules
  initDatabase();

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
  const dbClient = createDbClient();
  const usersRepository = new UsersRepository(dbClient);
  const todosRepository = new TodosRepository(dbClient);
  const jwtService = createJwtService(env);
  const passwordService = createPasswordService();
  const authService = createAuthService(
    usersRepository,
    jwtService,
    passwordService
  );
  const todoService = createTodoService(todosRepository);
  const services: Services = { todoService, authService };

  // create the app
  const app = express();

  // register global middleware
  if (env.NODE_ENV === 'development') {
    // logs the request verb and url
    app.use(logRequest(logger));
  }

  app.use(
    // add security HTTP headers
    helmet(),
    // enables CORS
    cors(/* TODO: configure origins */),
    // parses the body of application/json requests
    json(),
    // compresses response bodies
    compression(),
    // makes the services available to the route handlers by attaching them to the request
    attachServices(services)
  );

  // register routes
  for (const {
    method,
    path,
    request,
    authenticate = false,
    middlewares = [],
    handler,
  } of routes) {
    if (request) {
      middlewares.push(validateRequest(request));
    }

    if (authenticate) {
      middlewares.push(validateAccessToken(env.JWT_SECRET));
    }

    app[method](path, ...middlewares, handler);
  }

  // register error handlers
  app.use(handleServiceError());
  app.use(handleUnauthorizedError());
  app.use(errorHandler(logger));

  // define an app tear down function
  const destroy = async () => {
    await destroyDbClient(dbClient);
  };

  return { app, destroy };
}
