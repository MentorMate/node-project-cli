import z from 'zod';
import { generateDocument, reformatPathParams } from './openapi';
import { response, RouteDefinition } from '@utils/api';
import { ZodOpenApiRequestBodyObject } from 'zod-openapi';

describe('reformatPathParams', () => {
  it('should change the format of the path params', () => {
    expect(reformatPathParams('/users/:userId/posts/:postId')).toBe(
      '/users/{userId}/posts/{postId}'
    );
  });
});

describe('generateDocument', () => {
  const route: RouteDefinition = {
    operationId: 'route-id',
    summary: 'Does something',
    description: 'It does somehting',
    tags: ['tag'],
    method: 'post',
    path: '/users/:id',
    handler: (_req, res) => {
      res.send('OK');
    },
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'Laundry',
                },
              },
              required: ['name'],
            },
          },
        },
      },
    },
  };

  it('should define bearer token authentication', () => {
    const document = generateDocument({
      version: '3.0.3',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      routes: [],
    });

    expect(document.components?.securitySchemes?.bearerAuth).toEqual({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
  });

  describe('when the route requires authentication', () => {
    const routeWithAuth: RouteDefinition = {
      ...route,
      authenticate: true,
    };

    it('should add security definitions', () => {
      const document = generateDocument({
        version: '3.0.3',
        info: {
          title: 'My API',
          version: '1.0.0',
        },
        routes: [routeWithAuth],
      });

      const definition =
        document?.paths?.[reformatPathParams(route.path)][route.method];

      expect(definition?.security).toEqual([
        {
          bearerAuth: [],
        },
      ]);
    });
  });

  describe('when a route has responses schemas', () => {
    it('should not try to convert non-zod response schemas', () => {
      const routeWithJsonSchemaResponse: RouteDefinition = {
        ...route,
        responses: {
          204: response.NoContent,
        },
      };

      const document = generateDocument({
        version: '3.0.3',
        info: {
          title: 'My API',
          version: '1.0.0',
        },
        routes: [routeWithJsonSchemaResponse],
      });

      const definition =
        document?.paths?.[reformatPathParams(route.path)][route.method];

      expect(definition?.responses['204']).toEqual({
        description: 'No Content',
      });
    });

    it('should map zod schemas to application/json content schemas', () => {
      const routeWithJsonSchemaResponse: RouteDefinition = {
        ...route,
        request: {
          body: z.object({
            id: z.number().int(),
            name: z.string(),
          }),
        },
        responses: {
          200: z.object({
            id: z.number().int(),
            name: z.string(),
          }),
        },
      };

      const document = generateDocument({
        version: '3.0.3',
        info: {
          title: 'My API',
          version: '1.0.0',
        },
        routes: [routeWithJsonSchemaResponse],
      });

      const definition =
        document?.paths?.[reformatPathParams(route.path)][route.method];

      expect(
        (definition?.requestBody as ZodOpenApiRequestBodyObject)['content']
      ).toHaveProperty('application/json');
      expect(definition?.responses['200'].content).toHaveProperty(
        'application/json'
      );
    });

    it('should provide a default description when one is not available for the status code', () => {
      const routeWithDefaultDescription: RouteDefinition = {
        ...route,
        responses: {
          1234: z.object({}),
        },
      };

      const document = generateDocument({
        version: '3.0.3',
        info: {
          title: 'My API',
          version: '1.0.0',
        },
        routes: [routeWithDefaultDescription],
      });

      const definition =
        document?.paths?.[reformatPathParams(route.path)][route.method];

      expect(definition?.responses['1234'].description).toBe(
        'Unknown response code'
      );
    });
  });
});
