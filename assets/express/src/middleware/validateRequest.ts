import { RequestKey, RequestSchema } from '@common';
import { RequestHandler } from 'express';

export const validateRequest = function (
  schema: RequestSchema
): RequestHandler {
  return function (req, _res, next) {
    const result = schema.safeParse(req);

    if (!result.success) {
      next(result.error);
      return;
    }

    for (const [k, v] of Object.entries(result.data)) {
      req[k as RequestKey] = v;
    }
    next();
  };
};
