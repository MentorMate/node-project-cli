import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  RequestHandler as ExpressRequestHandler,
  ErrorRequestHandler as ExpressErrorHandler,
} from 'express';
import { AnyZodObject, z } from 'zod';

type Request = NonNullable<RouteConfig['request']>;

export type RequestKey = keyof Request;

export type RequestSchema<
  Params extends AnyZodObject = AnyZodObject,
  Query extends AnyZodObject = AnyZodObject,
  Body extends AnyZodObject = AnyZodObject,
  Headers extends AnyZodObject = AnyZodObject
> = {
  params?: Params;
  query?: Query;
  body?: Body;
  headers?: Headers;
};

export type RequestHandler<Schema extends RequestSchema = RequestSchema> =
  ExpressRequestHandler<
    z.infer<Exclude<Schema['params'], undefined>>,
    unknown,
    z.infer<Exclude<Schema['body'], undefined>>,
    z.infer<Exclude<Schema['query'], undefined>>
  >;

export type ErrorHandler<T extends RequestSchema = RequestSchema> =
  ExpressErrorHandler<
    z.infer<Exclude<T['params'], undefined>>,
    unknown,
    z.infer<Exclude<T['body'], undefined>>,
    z.infer<Exclude<T['query'], undefined>>
  >;

/**
 * A utility function that does the `.catch(next)` for you.
 * This is, basically, `express-async-handler`: https://github.com/Abazhenov/express-async-handler/blob/master/index.js
 *
 * Example:
 * ```
 * // this
 * function (req, res, next) {
 *   service.create(req.body)
 *     .then(record => res.status(201).send(record))
 *     .catch(next);
 * }
 *
 * // turns into
 * asyncHandler(async function(req, res) {
 *   const todo = await service.create(req.body);
 *   res.status(201).send(todo);
 * })
 * ```
 */
export const asyncHandler = <
  S extends RequestSchema,
  H extends RequestHandler<S>
>(
  handler: H
): RequestHandler<S> => {
  return function (req, res, next) {
    const result = handler(req, res, next);
    return Promise.resolve(result).catch(next);
  };
};
