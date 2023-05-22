import { RequestHandler } from 'express';
import { Logger } from 'pino';

/**
 * Logs the incoming request's method and URL, e.g. `GET /todos/1`
 */
export const logRequest = function (logger: Logger): RequestHandler {
  return function ({ method, url }, _res, next) {
    logger.info(`${method} ${url}`);
    next();
  };
};
