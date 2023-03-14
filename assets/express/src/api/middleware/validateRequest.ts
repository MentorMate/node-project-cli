import { z } from 'zod';
import createError from 'http-errors';
import { RequestSchema, RequestKey } from '../intefaces';
import { RequestHandler } from 'express';

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
