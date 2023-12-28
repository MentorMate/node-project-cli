declare module 'query-types' {
  import { RequestHandler } from 'express';

  function middleware(): RequestHandler;
}
