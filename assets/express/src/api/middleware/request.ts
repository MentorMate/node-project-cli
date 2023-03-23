import { RequestHandler } from 'express';
import { expressjwt as jwt } from 'express-jwt';
import { Logger } from 'pino';
import createError from 'http-errors';
import z from 'zod';
import { RequestSchema, RequestKey } from '../interfaces';
import { Services } from '@modules';

export const attachServices =
  (services: Services): RequestHandler =>
  (req, _res, next) => {
    req.services = services;
    next();
  };

export const validateAccessToken = (secret: string) =>
  jwt({
    secret,
    algorithms: ['HS256'],
  });

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
