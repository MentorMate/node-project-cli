import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Concat } from '@common/utils';
import {
  RequestHandler as ExpressRequestHandler,
  ErrorRequestHandler as ExpressErrorHandler,
} from 'express';
import { Token } from 'typedi';
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

type InferInjects<Tuple extends ReadonlyArray<unknown>> = {
  [Index in keyof Tuple]: Tuple[Index] extends Token<infer Injectable>
    ? Injectable
    : Tuple[Index] extends { prototype: infer P }
    ? P
    : never;
};

type RequestHandlerFromSchema<Schema extends RequestSchema> =
  ExpressRequestHandler<
    z.infer<Exclude<Schema['params'], undefined>>,
    unknown,
    z.infer<Exclude<Schema['body'], undefined>>,
    z.infer<Exclude<Schema['query'], undefined>>
  >;

type RequestHandlerWithInjects<Inject extends ReadonlyArray<unknown>> =
  (...args: Concat<[Parameters<ExpressRequestHandler>, InferInjects<Inject>]>) => ReturnType<ExpressRequestHandler>;

type RequestHandlerWithInjectsAndSchema<
  Schema extends RequestSchema,
  Inject extends ReadonlyArray<unknown>
> = (
  ...args: Concat<
    [Parameters<RequestHandlerFromSchema<Schema>>, InferInjects<Inject>]
  >
) => ReturnType<RequestHandlerFromSchema<Schema>>;


export type RequestHandler<
  Schema extends RequestSchema | undefined = undefined,
  Inject extends ReadonlyArray<unknown> | undefined = undefined
> = Schema extends RequestSchema
    ? Inject extends ReadonlyArray<unknown>
      ? RequestHandlerWithInjectsAndSchema<Schema, Inject>
      : RequestHandlerFromSchema<Schema>
    : Inject extends ReadonlyArray<unknown>
      ? RequestHandlerWithInjects<Inject>
      : ExpressRequestHandler;

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
  I extends ReadonlyArray<unknown>
>(
  handler: RequestHandler<S, I>
): RequestHandler<S, I> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return function (req, res, next, ...args) {
    const result = handler(req, res, next, ...args);
    return Promise.resolve(result).catch(next);
  };
};
