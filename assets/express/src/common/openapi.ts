import { AnyZodObject, ZodObject } from 'zod';
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
    ...(route.authenticate && {
      security: [{
        bearerAuth: []
      }]
    }),
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
};

const schemaName = (schema: AnyZodObject) =>
  schema._def.openapi?.metadata?.schemaName;

const registerSchema = (registry: OpenAPIRegistry, schema: AnyZodObject) => {
  const name = schemaName(schema);

  if (!name) {
    return;
  }

  const registered = !!registry.definitions.find(
    (d) => d.type === 'schema' && name === schemaName(d.schema as never)
  );

  if (registered) {
    return;
  }

  registry.register(name, schema);
};

const registerRoutes = (
  registry: OpenAPIRegistry,
  routes: RouteDefinition[]
) => {
  for (const route of routes) {
    if (route.request?.body) {
      registerSchema(registry, route.request.body);
    }

    if (route.request?.query) {
      registerSchema(registry, route.request.query);
    }

    if (route.request?.params) {
      registerSchema(registry, route.request.params);
    }

    if (route.request?.headers) {
      registerSchema(registry, route.request.headers);
    }

    for (const response of Object.values(route.responses)) {
      if (response instanceof ZodObject) {
        registerSchema(registry, response);
      }
    }

    registerRoute(registry, route);
  }
};

export const generateDocument = (
  // 3.1.0 is not yet supported by our version of swagger-ui
  version: Exclude<OpenApiVersion, '3.1.0'>,
  routes: RouteDefinition[]
) => {
  const registry = new OpenAPIRegistry();

  registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT'
  });

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
