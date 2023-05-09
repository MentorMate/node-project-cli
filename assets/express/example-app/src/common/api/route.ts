import { ZodOpenApiResponseObject } from 'zod-openapi';
import { RequestSchema, RequestHandler } from './handler';
import { RequestHandler as ExpressRequestHandler } from 'express';
import { AnyZodObject } from 'zod';

type Responses = {
  [statusCode: string]: ZodOpenApiResponseObject | AnyZodObject;
};

export type RouteDefinition<S extends RequestSchema = RequestSchema> = {
  operationId: string;
  summary?: string;
  description?: string;
  tags?: string[];
  method: 'get' | 'put' | 'post' | 'delete' | 'patch';
  path: string;
  authenticate?: boolean;
  request?: S;
  middleware?: Array<ExpressRequestHandler | RequestHandler<S>>;
  handler: RequestHandler<S>;
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

export const defineRoute = <S extends RequestSchema>(
  route: Omit<RouteDefinition<S>, 'handler'>
) => ({
  attachHandler: (
    handler: RouteDefinition<S>['handler']
  ): RouteDefinition<S> => ({ ...route, handler }),
});
