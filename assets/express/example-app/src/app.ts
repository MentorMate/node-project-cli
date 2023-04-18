import { Container } from 'typedi';
import express, { json, RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pino from 'pino';
import queryType from 'query-types';
import { NotFound, Conflict, Unauthorized } from 'http-errors';
import { UnauthorizedError } from 'express-jwt';
import { DB_CLIENT, ENV } from '@common/di';
import {
  onInit as initDatabase,
  create as createDbClient,
  destroy as destroyDbClient,
  RecordNotFound,
  DuplicateRecord,
} from '@modules/database';
import {
  routes,
  handleError,
  mapErrors,
  logRequest,
  validateRequest,
  validateAccessToken,
} from '@api';
import { Environment } from '@common/environment';

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

  // Register services with the DI container using Tokens
  Container.set(ENV, env);
  Container.set(DB_CLIENT, dbClient);

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
    // handles numeric and boolean values for Express req.query object
    queryType.middleware()
  );

  // register routes
  for (const {
    method,
    path,
    request,
    inject,
    authenticate = false,
    middleware = [],
    handler,
  } of routes) {
    if (authenticate) {
      middleware.push(validateAccessToken(env.JWT_SECRET));
    }

    if (request) {
      middleware.push(validateRequest(request));
    }
    
    let _handler = handler;

    if (inject) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      _handler = function (req, res, next) {
        const injectables = inject.map(i => Container.get(i as never));
        handler(req, res, next, ...injectables as never[]);
      };
    }

    app[method](
      path,
      ...(middleware as RequestHandler[]),
      _handler as RequestHandler
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
