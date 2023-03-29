import express, { json, RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pino from 'pino';
import queryType from 'query-types';
import { NotFound, Conflict, Unauthorized } from 'http-errors';
import { UnauthorizedError } from 'express-jwt';

import {
  onInit as initDatabase,
  create as createDbClient,
  destroy as destroyDbClient,
  TodosRepository,
  UsersRepository,
  RecordNotFound,
  DuplicateRecord,
} from '@modules/database';
import {
  routes,
  handleError,
  mapErrors,
  logRequest,
  validateRequest,
  attachServices,
  validateAccessToken,
} from '@api';
import { Environment } from '@common/environment';
import { JwtService, PasswordService, AuthService } from '@modules/auth';
import { TodosService } from '@modules/todos';
import { Services } from '@modules';

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
  const services: Services = { todosService, authService };

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

  // register routes
  for (const {
    method,
    path,
    request,
    authenticate = false,
    middleware = [],
    handler,
  } of routes) {
    if (request) {
      middleware.push(validateRequest(request));
    }

    if (authenticate) {
      middleware.push(validateAccessToken(env.JWT_SECRET));
    }

    app[method](
      path,
      ...(middleware as RequestHandler[]),
      handler as RequestHandler
    );
  }

  // register error handlers
  app.use(
    mapErrors({
      [RecordNotFound.name]: NotFound,
      [DuplicateRecord.name]: Conflict,
      [UnauthorizedError.name]: Unauthorized,
    })
  );

  app.use(handleError(logger));

  // define an app tear down function
  const destroy = async () => {
    await destroyDbClient(dbClient);
  };

  return { app, destroy };
}
