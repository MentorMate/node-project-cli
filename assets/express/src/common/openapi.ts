import z from 'zod';
import {
  OpenAPIGenerator,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { OpenApiVersion } from '@asteasolutions/zod-to-openapi/dist/openapi-generator';
import { RouteDefinition } from '@api';
import httpStatuses from 'statuses';

// Changes the path param placeholder syntax from `:param` to `{param}`
const reformatPathParams = (path: string) =>
  path.replaceAll(/:[a-zA-Z]+/g, (match) => `{${match.substring(1)}}`);

const registerRoute = (
  registry: OpenAPIRegistry,
  { path, request, responses, ...route }: RouteDefinition
) => {
  registry.registerPath({
    operationId: route.operationId,
    summary: route.summary,
    description: route.description,
    tags: route.tags,
    method: route.method,
    path: reformatPathParams(path),
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
        schema instanceof z.ZodObject
          ? {
              description:
                httpStatuses.message[code as never as number] ??
                'Unknown response code',
              condent: { 'application/json': { schema } },
            }
          : schema,
      ])
    ),
  });
};

const registerRoutes = (
  registry: OpenAPIRegistry,
  routes: RouteDefinition[]
) => {
  for (const route of routes) {
    registerRoute(registry, route);
  }
};

export const generateDocument = (
  registry: OpenAPIRegistry,
  // 3.1.0 is not yet supported by our version of swagger-ui
  version: Exclude<OpenApiVersion, '3.1.0'>,
  routes: RouteDefinition[]
) => {
  registerRoutes(registry, routes);

  const generator = new OpenAPIGenerator(registry.definitions, version);

  const document = generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'My API',
      description: 'This is the API',
    },
    servers: [],
  });

  return document;
};
