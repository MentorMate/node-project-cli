import {
  RequestHandler as ExpressRequestHandler,
  ErrorRequestHandler,
} from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    decodedUser?: {
      email: string;
      role: string;
    };
  }
}

export type RequestHandler = ExpressRequestHandler;

type HTTPMethods =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head';
interface ReqSchema {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}
export type RequestKey = 'headers' | 'params' | 'query' | 'body';

export type Service = object;
export type Controller = object;
export interface Middlewares {
  [key: string]: RequestHandler | GenericRequestHandler | GenericErrorHandler;
}

export interface DbLayerNamespace<I, P, E> {
  [key: string]: IDbLayer<I, P, E>;
}

interface DbLayerTypization {
  id: unknown;
  payload: unknown;
  entity: unknown;
}

export interface ServiceFactory<
  D extends DbLayerTypization,
  S extends Service,
  H extends Record<string, CallableFunction> | undefined = undefined
> {
  (
    dbLayer: IDbLayer<D['id'], D['payload'], D['entity']>,
    HelperFunctions: H
  ): S;
}
export interface ControllerFactory<
  S extends Service,
  C extends Controller,
  M extends Middlewares
> {
  (service: S, middlewares: M): C;
}

export interface ModuleFactory<
  D extends DbLayerTypization,
  C extends Controller,
  M extends Middlewares
> {
  (
    DbLayerNamespace: DbLayerNamespace<D['id'], D['payload'], D['entity']>,
    middlewares: M
  ): C;
}

export type GenericRequestHandler<
  T extends ReqSchema = { query: unknown; params: unknown; body: unknown },
  ResBody = unknown
> = ExpressRequestHandler<T['params'], ResBody, T['body'], T['query']>;
export type GenericErrorHandler<
  T extends ReqSchema = { query: unknown; params: unknown; body: unknown },
  ResBody = unknown
> = ErrorRequestHandler<T['params'], ResBody, T['body'], T['query']>;

export interface RouteOptions<T extends ReqSchema, ResBody = unknown> {
  method: HTTPMethods;
  url: string;
  middlewares: (
    | RequestHandler
    | GenericRequestHandler<T, ResBody>
    | GenericErrorHandler<T, ResBody>
  )[];
  handler: GenericRequestHandler<T, ResBody>;
}

export interface IDbLayer<I, P, E> {
  get: (id: I) => Promise<E | null>;
  getAll: () => Promise<E[]>;
  create: (payload: P) => Promise<E | null>;
  update: (payload: P) => Promise<E | null>;
  delete: (id: I) => Promise<boolean>;
}
