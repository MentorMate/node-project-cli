import { json, Express, RequestHandler } from 'express';
import { verifyJWT } from './jwt-auth';
import { validateRequest } from './validateRequest';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

const logRequest = function (): RequestHandler {
  return function (req, _res, next) {
    // DO NOT use console: https://expressjs.com/en/advanced/best-practice-performance.html#do-logging-correctly
    console.info(`${req.method} ${req.path}`);
    next();
  };
};

export function middlewareFactory(app: Express) {
  app.use([
    logRequest(),
    helmet(),
    cors(),
    json(),
    // DO compression: https://expressjs.com/en/advanced/best-practice-performance.html#use-gzip-compression
    compression(),
  ]);

  return {
    verifyJWT,
    validateRequest,
  };
}
