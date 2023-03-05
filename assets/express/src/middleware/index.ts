import { json, RequestHandler, ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { Logger } from 'pino';
import createError from 'http-errors';

export * from './jwt-auth'
export * from './validateRequest'

const logRequest = function (logger: Logger): RequestHandler {
  return function({ method, path }, _res, next) {
    // DO NOT use console: https://expressjs.com/en/advanced/best-practice-performance.html#do-logging-correctly
    logger.info({ method, path });
    next();
  };
};

const errorHandler = function (logger: Logger): ErrorRequestHandler {
  return function (err, _req, res, next) {
    // https://expressjs.com/en/guide/error-handling.html
    // If you call next() with an error after you have started writing the response (for example, if you encounter an error while streaming
    // the response to the client) the Express default error handler closes the connection and fails the request.
    // So when you add a custom error handler, you must delegate to the default Express error handler, when the headers have already
    // been sent to the client
    if (res.headersSent) {
      return next(err)
    }

    if (createError.isHttpError(err)) {
      res
        .status(err.statusCode)
        .send({
          message: err.message,
          ...(err.errors && { errors: err.errors }),
        });
    } else {
      logger.error(err);

      res
        .status(500)
        .send({ message: 'Internal Server Error' });
    }
  };
};

export const initateMiddlewares = function(logger: Logger) {
  return [
    logRequest(logger),
    helmet(),
    cors(),
    json(),
    compression(),
    errorHandler(logger)
  ];
}

