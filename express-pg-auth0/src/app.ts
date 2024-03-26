import express, { json, Request, RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pino from 'pino';
import queryType from 'query-types';
import { NotFound, Conflict } from 'http-errors';

import { Environment } from '@utils/environment';
import {
  onInit as initDatabase,
  create as createDbClient,
  destroy as destroyDbClient,
  RecordNotFoundError,
  DuplicateRecordError,
} from '@database';
import {
  handleError,
  mapError,
  logRequest,
  validateRequest,
  attachServices,
} from '@middleware';

import { Auth0Service, AuthService, authGuard, authRoutes } from '@api/auth';
import { healthcheckRoutes } from '@api/healthchecks';
import { TodosRepository, TodosService, todoRoutes } from '@api/todos';
import { UsersRepository } from '@api/users';
import axios from 'axios';

export function create(env: Environment) {
  // init modules
  initDatabase();

  // create a logger
  const logger = pino({
    name: 'http',
    ...(env.NODE_ENV === 'development' && {
      transport: {
        target: 'pino-pretty',
      },
    }),
  });

  // create services
  const dbClient = createDbClient();
  const usersRepository = new UsersRepository(dbClient);
  const todosRepository = new TodosRepository(dbClient);
  const auth0Service = new Auth0Service(logger, axios, env);
  const authService = new AuthService(logger, auth0Service, usersRepository);
  const todosService = new TodosService(todosRepository);
  const services: Request['services'] = { todosService, authService };

  // create the app
  const app = express();

  if (env.REQUEST_LOGGING) {
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
    attachServices(services),
    // handles numeric and boolean values for Express req.query object
    queryType.middleware()
  );

  // flatten all routes into an array
  // alternatively, a separate router instance can be used
  // for each group of routes (group by prefix)
  const routes = [...healthcheckRoutes, ...authRoutes, ...todoRoutes];

  // register routes
  for (const {
    method,
    path,
    request,
    authenticate = false,
    middleware = [],
    handler,
  } of routes) {
    if (authenticate) {
      middleware.push(authGuard(env.AUTH0_AUDIENCE, env.AUTH0_ISSUER_URL));
    }

    if (request) {
      middleware.push(validateRequest(request));
    }

    // eslint-disable-next-line security/detect-object-injection
    app[method](
      path,
      ...(middleware as RequestHandler[]),
      handler as RequestHandler
    );
  }

  // register error handlers
  app.use(
    mapError({
      [RecordNotFoundError.name]: NotFound,
      [DuplicateRecordError.name]: Conflict,
    }),
    handleError(logger, env.ERROR_LOGGING)
  );

  // define an app tear down function
  const destroy = async () => {
    await destroyDbClient(dbClient);
  };

  return { app, dbClient, destroy };
}
