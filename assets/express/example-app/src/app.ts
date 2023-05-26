import express, { json, Request, RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pino from 'pino';
import queryType from 'query-types';
import { NotFound, Conflict, Unauthorized } from 'http-errors';
import { UnauthorizedError } from 'express-jwt';

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
  validateJwt,
} from '@middleware';

import { JwtService, PasswordService, AuthService, authRoutes } from '@auth';
import { healthcheckRoutes } from '@healthchecks';
import { helloWorldRoutes } from '@hello-world';
import { TodosRepository, TodosService, todoRoutes } from '@todos';
import { UsersRepository } from '@users';

export function create(env: Environment) {
  // init modules
  initDatabase();

  // create a logger
  const logger = pino({
    name: 'http',
    ...(env.NODE_ENV === 'development' && {
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
  const jwtService = new JwtService(env);
  const passwordService = new PasswordService();
  const authService = new AuthService(
    usersRepository,
    jwtService,
    passwordService
  );
  const todosService = new TodosService(todosRepository);
  const services: Request['services'] = { todosService, authService };

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
    attachServices(services),
    // handles numeric and boolean values for Express req.query object
    queryType.middleware()
  );

  // flatten all routes into an array
  // alternatively, a separate router instance can be used
  // for each group of routes (group by prefix)
  const routes = [
    ...helloWorldRoutes,
    ...healthcheckRoutes,
    ...authRoutes,
    ...todoRoutes,
  ];

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
      middleware.push(validateJwt(env.JWT_SECRET));
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
      [UnauthorizedError.name]: Unauthorized,
    }),
    handleError(logger)
  );

  // define an app tear down function
  const destroy = async () => {
    await destroyDbClient(dbClient);
  };

  return { app, destroy };
}
