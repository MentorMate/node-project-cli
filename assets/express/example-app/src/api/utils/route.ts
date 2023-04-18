import { ResponseConfig, RouteConfig } from '@asteasolutions/zod-to-openapi';
import { RequestSchema, RequestHandler } from './handler';
import { RequestHandler as ExpressRequestHandler } from 'express';
import { AnyZodObject } from 'zod';

type Responses = { [statusCode: string]: ResponseConfig | AnyZodObject };

type Inject = readonly [unknown, ...unknown[]];

export type RouteDefinition<
  S extends RequestSchema | undefined = RequestSchema,
  I extends Inject | undefined = undefined,
> = {
  operationId: string;
  summary?: string;
  description?: string;
  tags?: string[];
  method: RouteConfig['method'];
  path: string;
  authenticate?: boolean;
  request?: S;
  inject?: I;
  middleware?: Array<ExpressRequestHandler | RequestHandler<S, I>>;
  handler: RequestHandler<S, I>;
  responses: Responses;
};

export const prefixRoute = <R extends { path: string }>(
  prefix: string,
  route: R
): R => ({
  ...route,
  path: `${prefix}${route.path}`,
});

export const prefixRoutes = <R extends { path: string }>(
  prefix: string,
  routes: R[]
): R[] => routes.map((route) => prefixRoute(prefix, route));

export const defineRoute = <
  S extends RequestSchema | undefined = undefined,
  I extends Inject | undefined = undefined,
>(
  route: Omit<RouteDefinition<S, I>, 'handler'>
) => ({
  attachHandler: (
    handler: RouteDefinition<S, I>['handler']
  ): RouteDefinition<S, I> => ({ ...route, handler }),
});
