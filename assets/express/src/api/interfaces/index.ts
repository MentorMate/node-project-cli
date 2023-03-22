import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  RequestHandler as ExpressRequestHandler,
  ErrorRequestHandler,
} from 'express';
import { AnyZodObject, z } from 'zod';

declare module 'express-serve-static-core' {
  interface Request {
    decodedUser?: {
      email: string;
    };
  }
}

export type RequestHandler = ExpressRequestHandler;
type HttpMethod = RouteConfig['method'];
export type RequestKey = keyof NonNullable<RouteConfig['request']>;
// export type RequestSchema = Record<RequestKey, z.ZodObject<z.ZodRawShape>>
// export type RequestSchema = { [k in RequestKey]?: z.AnyZodObject }
// export type RequestSchema = z.ZodObject<{ [k in RequestKey]?: z.AnyZodObject }>
export type RequestSchema = Omit<
  NonNullable<RouteConfig['request']>,
  'body' | 'headers'
> & { body?: AnyZodObject; headers?: AnyZodObject };

export type GenericRequestHandler<T extends RequestSchema = RequestSchema> =
  ExpressRequestHandler<
    z.infer<Exclude<T['params'], undefined>>,
    unknown,
    z.infer<Exclude<T['body'], undefined>>,
    z.infer<Exclude<T['query'], undefined>>
  >;
export type GenericErrorHandler<T extends RequestSchema = RequestSchema> =
  ErrorRequestHandler<
    z.infer<Exclude<T['params'], undefined>>,
    unknown,
    z.infer<Exclude<T['body'], undefined>>,
    z.infer<Exclude<T['query'], undefined>>
  >;

export type RouteDefinition<T extends RequestSchema = RequestSchema> = {
  operationId: string;
  summary?: string;
  description?: string;
  tags?: string[];
  responses: Record<number, unknown>;
  method: HttpMethod;
  path: string;
  request?: T;
  middlewares?: (
    | ExpressRequestHandler
    | GenericRequestHandler<T>
    | GenericErrorHandler<T>
  )[];
  handler: GenericRequestHandler<T>;
  authenticate?: boolean;
};

export interface RouteOptions<T extends RequestSchema = RequestSchema> {
  (service: any): RouteDefinition<T>;
}
