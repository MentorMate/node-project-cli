import { ZodObject, ZodType } from 'zod';
import {
  OpenAPIGenerator,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { OpenApiVersion } from '@asteasolutions/zod-to-openapi/dist/openapi-generator';
import { RouteDefinition } from '@common/api';
import httpStatuses from 'statuses';

// Changes the path param placeholder syntax from `:param` to `{param}`
export const reformatPathParams = (path: string) =>
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
      security: [
        {
          bearerAuth: [],
        },
      ],
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
        schema instanceof ZodType
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

const getRefId = <Schema extends ZodType>(schema: Schema) =>
  schema._def.openapi?.metadata?.refId;

const registerSchema = <Schema extends ZodType>(
  registry: OpenAPIRegistry,
  registeredSchemas: Map<string, ZodType>,
  schema: Schema
): Schema => {
  if (schema instanceof ZodObject) {
    for (const [k, v] of Object.entries(schema.shape)) {
      schema.shape[k] = registerSchema(
        registry,
        registeredSchemas,
        v as ZodType
      );
    }
  }

  const refId = getRefId(schema);

  if (!refId) {
    return schema;
  }

  if (registeredSchemas.has(refId)) {
    return registeredSchemas.get(refId) as Schema;
  }

  const registeredSchema = registry.register(refId, schema);
  registeredSchemas.set(refId, registeredSchema);
  return registeredSchema;
};

const registerRoutes = (
  registry: OpenAPIRegistry,
  routes: RouteDefinition[]
) => {
  const registeredSchemas = new Map<string, ZodType>();

  for (const route of routes) {
    if (route.request?.body) {
      route.request.body = registerSchema(
        registry,
        registeredSchemas,
        route.request.body
      );
    }

    if (route.request?.query) {
      route.request.query = registerSchema(
        registry,
        registeredSchemas,
        route.request.query
      );
    }

    if (route.request?.params) {
      route.request.params = registerSchema(
        registry,
        registeredSchemas,
        route.request.params
      );
    }

    if (route.request?.headers) {
      route.request.headers = registerSchema(
        registry,
        registeredSchemas,
        route.request.headers
      );
    }

    for (const [code, response] of Object.entries(route.responses)) {
      if (response instanceof ZodObject) {
        route.responses[code] = registerSchema(
          registry,
          registeredSchemas,
          response
        );
      }
    }

    registerRoute(registry, route);
  }
};

export const getDocumentGenerator = (
  // 3.1.0 is not yet supported by our version of swagger-ui
  version: Exclude<OpenApiVersion, '3.1.0'>,
  routes: RouteDefinition[]
) => {
  const registry = new OpenAPIRegistry();

  registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  registerRoutes(registry, routes);

  for (const def of registry.definitions) {
    if (def.type !== 'schema') {
      continue;
    }

    const meta = def.schema._def?.openapi?.metadata;

    if (meta) {
      delete meta.refId;
    }
  }

  return new OpenAPIGenerator(registry.definitions, version);
};
