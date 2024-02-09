import { ErrorRequestHandler } from 'express';

// TODO: utilize the mapError utility function
export const mapError = function (
  map: Record<string, { new (message: string): Error }>
): ErrorRequestHandler {
  return function (err, _req, _res, next) {
    const errorClass = map[err.name];
    const error = errorClass ? new errorClass(err.message) : err;
    next(error);
  };
};
