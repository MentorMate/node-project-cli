import {
  RequestHandler as ExpressRequestHandler,
  ErrorRequestHandler,
} from 'express';
import { z } from 'zod'

declare module 'express-serve-static-core' {
  interface Request {
    decodedUser?: {
      email: string;
      role: string;
    };
  }
}

export type RequestHandler = ExpressRequestHandler;
export type HTTPMethod =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head';
export type RequestKey = 'params' | 'query' | 'body';
export type RequestSchema = z.ZodObject<{ [k in RequestKey]?: z.AnyZodObject }>

export type GenericRequestHandler<
  T extends RequestSchema = RequestSchema,
> = ExpressRequestHandler<z.infer<T>['params'], unknown, z.infer<T>['body'], z.infer<T>['query']>;
export type GenericErrorHandler<
  T extends RequestSchema = RequestSchema,
> = ErrorRequestHandler<z.infer<T>['params'], unknown, z.infer<T>['body'], z.infer<T>['query']>;

export interface RouteOptions<T extends RequestSchema = RequestSchema> {
  method: HTTPMethod;
  url: string;
  requestSchema?: T
  middlewares: (
    | ExpressRequestHandler
    | GenericRequestHandler<T>
    | GenericErrorHandler<T>
  )[];
  handler: GenericRequestHandler<T>;
}

