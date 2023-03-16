import express from 'express';
import pino from 'pino';
import { ZodObject } from 'zod';
import httpStatuses from 'statuses';
import { OpenAPIGenerator } from '@asteasolutions/zod-to-openapi';

import { initializeKnex } from './database/initilize-knex';
import createDbRepos from '@database';
import apiDefinitionFactory from '@api';
import { initializeMiddlewares, validateRequest } from './api/middleware';
import { registry } from '@modules';

import { asyncHandler } from '@common';
import { Environment } from '@common/environment';

export function create(env: Environment) {
  // create a logger
  const logger = pino({
    name: 'http',
    ...(env.NODE_ENV !== 'production' && {
      transport: {
        target: 'pino-pretty',
        colorize: false,
      },
    }),
  });

  const app = express();
  const knex = initializeKnex(logger);
  const dbRepositories = createDbRepos(knex);

  const apiRoutes = apiDefinitionFactory(dbRepositories);
  app.use(initializeMiddlewares(logger));

  for (const {
    method,
    path,
    request,
    synchronous,
    middlewares = [],
    handler,
  } of apiRoutes) {
    if (request) {
      middlewares.push(validateRequest(request));
    }

    const routeHandler = synchronous ? handler : asyncHandler(handler);

    app[method](path, ...middlewares, routeHandler);
  }

  // Hello world
  app.get('/', (_req, res) => {
    res.send('Hello world');
  });

  const destroy = async () => {
    await knex.destroy();
  };

  return {
    app,
    destroy,
    createOpenAPIDocument: () => {
      for (const {
        operationId,
        tags,
        summary,
        description,
        method,
        path,
        request,
        responses,
      } of apiRoutes) {
        registry.registerPath({
          operationId,
          tags,
          summary,
          description,
          method,
          path: path.replaceAll(
            /:[a-zA-Z]+/g,
            (match) => `{${match.substring(1)}}`
          ),
          ...(request && {
            request: {
              params: request.params,
              query: request.query,
              headers: request.headers,
              ...(request.body && {
                body: {
                  content: {
                    'application/json': {
                      schema: request.body,
                    },
                  },
                },
              }),
            },
          }),
          responses: Object.fromEntries(
            Object.entries(responses).map(([code, schema]) => [
              code,
              schema instanceof ZodObject
                ? {
                    description:
                      httpStatuses.message[code as never as number] ??
                      'Unknown response code',
                    content: { 'application/json': { schema } },
                  }
                : schema,
            ])
          ),
        });
      }

      const generator = new OpenAPIGenerator(registry.definitions, '3.0.0');

      const document = generator.generateDocument({
        info: {
          version: '1.0.0',
          title: 'My API',
          description: 'This is the API',
        },
        servers: [{ url: '' }],
      });

      return document;
    },
  };
}
