import { ErrorRequestHandler } from 'express';
import { Logger } from 'pino';
import createError from 'http-errors';

export const handleError = function (
  logger: Logger,
  logErrors: boolean
): ErrorRequestHandler {
  return function (err, _req, res, next) {
    // https://expressjs.com/en/guide/error-handling.html
    // If you call next() with an error after you have started writing the response (for example, if you encounter an error while streaming
    // the response to the client) the Express default error handler closes the connection and fails the request.
    // So when you add a custom error handler, you must delegate to the default Express error handler, when the headers have already
    // been sent to the client
    if (res.headersSent) {
      return next(err);
    }

    if (logErrors) {
      logger.error(err);
    }

    if (createError.isHttpError(err)) {
      res.status(err.statusCode).send({
        message: err.message,
        ...(err.errors && { errors: err.errors }),
      });
    } else {
      res.status(500).send({ message: 'Internal Server Error' });
    }
  };
};
