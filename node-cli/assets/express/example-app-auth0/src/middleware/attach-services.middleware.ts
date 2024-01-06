import { Request, RequestHandler } from 'express';

export const attachServices =
  (services: Request['services']): RequestHandler =>
  (req, _res, next) => {
    req.services = services;
    next();
  };
