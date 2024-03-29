import { ZodType } from 'zod';
import {
  ZodOpenApiVersion,
  createDocument,
  ZodOpenApiObject,
  ZodOpenApiPathsObject,
} from 'zod-openapi';
import { RouteDefinition } from '@utils/api';
import httpStatuses from 'statuses';

/**
 * Changes the path param placeholder syntax from `:param` to `{param}`
 */
export const reformatPathParams = (path: string) =>
  path.replaceAll(/:[a-zA-Z]+/g, (match) => `{${match.substring(1)}}`);

/**
 * Maps our route definitions to OpenAPI path definitions
 */
export const mapRouteToPath = ({
  request,
  responses,
  ...route
}: RouteDefinition) => ({
  operationId: route.operationId,
  summary: route.summary,
  description: route.description,
  tags: route.tags,
  ...(route.authenticate && {
    security: [
      {
        bearerAuth: [],
      },
    ],
  }),
  ...(request && {
    requestParams: {
      path: request.params,
      query: request.query,
      header: request.headers,
    },
  }),
  ...(request?.body && {
    requestBody: {
      content: {
        'application/json': {
          schema: request.body,
        },
      },
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

/**
 * Maps our route definitions to an OpenAPI paths object definition
 */
export const mapRoutesToPaths = (routes: RouteDefinition[]) =>
  routes.reduce((paths, route) => {
    const path = reformatPathParams(route.path);
    // eslint-disable-next-line security/detect-object-injection
    paths[path] ||= {};
    // eslint-disable-next-line security/detect-object-injection
    paths[path][route.method] = mapRouteToPath(route);
    return paths;
  }, {} as ZodOpenApiPathsObject);

/**
 * Generates the OpenAPI document
 */
export const generateDocument = ({
  version,
  info,
  routes,
}: {
  // 3.1.0 is not yet supported by our version of swagger-ui
  version: Exclude<ZodOpenApiVersion, '3.1.0'>;
  info: ZodOpenApiObject['info'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routes: RouteDefinition<any>[];
}) =>
  createDocument({
    openapi: version,
    info,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    paths: mapRoutesToPaths(routes),
  });
