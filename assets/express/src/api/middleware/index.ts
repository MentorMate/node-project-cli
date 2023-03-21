import { RequestHandler, ErrorRequestHandler } from 'express';
import { expressjwt as jwt } from 'express-jwt';
import { Logger } from 'pino';
import createError from 'http-errors';
import { z } from 'zod';
import { serviceToHttpErrorMap } from '@common';
import { TokensService } from '@modules';
import { RequestSchema, RequestKey } from '../interfaces';
import { Services } from '@app/modules';

export const attachServices =
  (services: Services): RequestHandler =>
  (req, _res, next) => {
    req.services = services;
    next();
  };

export const validateRequest = function (
  schema: RequestSchema
): RequestHandler {
  return function (req, _res, next) {
    const result = z.object(schema).safeParse(req);

    if (!result.success) {
      const error = createError.UnprocessableEntity('Bad Data');
      error.errors = result.error.issues;
      return next(error);
    }

    for (const [k, v] of Object.entries(result.data)) {
      req[k as RequestKey] = v;
    }

    next();
  };
};

/**
 * Logs the incoming request's method and URL, e.g. `GET /todos/1`
 */
export const logRequest = function (logger: Logger): RequestHandler {
  return function ({ method, url }, _res, next) {
    logger.info(`${method} ${url}`);
    next();
  };
};

export const handleServiceError =
  (): ErrorRequestHandler => (err, _req, _res, next) => {
    const klass = serviceToHttpErrorMap[err.name];
    const error = klass ? new klass(err.message) : err;
    next(error);
  };

export const errorHandler = function (logger: Logger): ErrorRequestHandler {
  return function (err, _req, res, next) {
    // https://expressjs.com/en/guide/error-handling.html
    // If you call next() with an error after you have started writing the response (for example, if you encounter an error while streaming
    // the response to the client) the Express default error handler closes the connection and fails the request.
    // So when you add a custom error handler, you must delegate to the default Express error handler, when the headers have already
    // been sent to the client
    if (res.headersSent) {
      return next(err);
    }

    if (createError.isHttpError(err)) {
      res.status(err.statusCode).send({
        message: err.message,
        ...(err.errors && { errors: err.errors }),
      });
    } else {
      logger.error(err);

      res.status(500).send({ message: 'Internal Server Error' });
    }
  };
};

const exceptionPaths: string[] = ['/', '/v1/auth/login', '/v1/auth/register'];

export const validateAccessToken = function (tokensService: TokensService) {
  const jwtConfig = tokensService.getJwtConfig();

  return jwt({ secret: jwtConfig.secret, algorithms: ['HS256'] }).unless({
    path: exceptionPaths,
  });
};
