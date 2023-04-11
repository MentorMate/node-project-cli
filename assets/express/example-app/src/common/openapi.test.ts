import z from 'zod';
import { getDocumentGenerator, reformatPathParams } from './openapi';
import { response, RouteDefinition } from '@api';
import { OpenAPIGenerator } from '@asteasolutions/zod-to-openapi';

describe('reformatPathParams', () => {
  it('should change the format of the path params', () => {
    expect(reformatPathParams('/users/:userId/posts/:postId')).toBe(
      '/users/{userId}/posts/{postId}'
    );
  });
});

describe('getDocumentGenerator', () => {
  it('should return an OpenAPI generator', () => {
    const generator = getDocumentGenerator('3.0.3', []);
    expect(generator).toBeInstanceOf(OpenAPIGenerator);
  });

  describe('document', () => {
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
      const generator = getDocumentGenerator('3.0.3', []);
      const document = generator.generateDocument({
        info: { title: 'My API', version: '1.0.0' },
      });
      expect(document.components?.securitySchemes?.bearerAuth).toEqual({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      });
    });

    it('should not register a schema twice', () => {
      const route1 = {
        ...route,
        request: {
          query: z.object({ name: z.string() }).openapi({ refId: 'TheSchema' }),
        },
      };
      const route2 = {
        ...route,
        request: {
          query: z.object({ age: z.number() }).openapi({ refId: 'TheSchema' }),
        },
      };

      const generator = getDocumentGenerator('3.0.3', [route1, route2]);
      const document = generator.generateDocument({
        info: { title: 'My API', version: '1.0.0' },
      });

      const schema = document.components?.schemas?.['TheSchema'] as never as {
        properties: Record<string, unknown>;
      };

      expect(schema.properties.name).toEqual({ type: 'string' });
      expect(schema.properties.age).not.toBeDefined();
    });

    describe('when the route requires authentication', () => {
      const routeWithAuth: RouteDefinition = {
        ...route,
        authenticate: true,
      };

      it('should add security definitions', () => {
        const generator = getDocumentGenerator('3.0.3', [routeWithAuth]);
        const document = generator.generateDocument({
          info: { title: 'My API', version: '1.0.0' },
        });

        const definition =
          document.paths[reformatPathParams(route.path)][route.method];

        expect(definition.security).toEqual([
          {
            bearerAuth: [],
          },
        ]);
      });
    });

    describe('when the route has a request schema', () => {
      describe('with a named query schema', () => {
        const routeWithQuery: RouteDefinition = {
          ...route,
          request: {
            query: z.object({ name: z.string() }).openapi({ refId: 'Query' }),
          },
        };

        it('should register it', () => {
          const generator = getDocumentGenerator('3.0.3', [routeWithQuery]);
          const document = generator.generateDocument({
            info: { title: 'My API', version: '1.0.0' },
          });
          expect(document.components?.schemas).toHaveProperty('Query');
        });
      });

      describe('with a named params schema', () => {
        const routeWithParams: RouteDefinition = {
          ...route,
          request: {
            params: z
              .object({ id: z.coerce.number() })
              .openapi({ refId: 'Params' }),
          },
        };

        it('should register it', () => {
          const generator = getDocumentGenerator('3.0.3', [routeWithParams]);
          const document = generator.generateDocument({
            info: { title: 'My API', version: '1.0.0' },
          });
          expect(document.components?.schemas).toHaveProperty('Params');
        });
      });

      describe('with a named headers schema', () => {
        const routeWithHeaders: RouteDefinition = {
          ...route,
          request: {
            headers: z
              .object({ accept: z.string() })
              .openapi({ refId: 'Headers' }),
          },
        };

        it('should register it', () => {
          const generator = getDocumentGenerator('3.0.3', [routeWithHeaders]);
          const document = generator.generateDocument({
            info: { title: 'My API', version: '1.0.0' },
          });
          expect(document.components?.schemas).toHaveProperty('Headers');
        });
      });

      describe('with a named body schema', () => {
        const routeWithBody: RouteDefinition = {
          ...route,
          request: {
            body: z.object({ name: z.string() }).openapi({ refId: 'Body' }),
          },
        };

        it('should register it', () => {
          const generator = getDocumentGenerator('3.0.3', [routeWithBody]);
          const document = generator.generateDocument({
            info: { title: 'My API', version: '1.0.0' },
          });
          expect(document.components?.schemas).toHaveProperty('Body');
        });
      });
    });

    describe('when a route has responses schemas', () => {
      it('should not try to convert non-zod response schemas', () => {
        const routeWithJsonSchemaResponse: RouteDefinition = {
          ...route,
          responses: {
            204: response.NoContent(),
          },
        };

        const generator = getDocumentGenerator('3.0.3', [
          routeWithJsonSchemaResponse,
        ]);
        const document = generator.generateDocument({
          info: { title: 'My API', version: '1.0.0' },
        });

        const definition =
          document.paths[reformatPathParams(route.path)][route.method];

        expect(definition.responses['204']).toEqual({
          description: 'No Content',
        });
      });

      it('should register them', () => {
        const routeWithNamedResponse: RouteDefinition = {
          ...route,
          responses: {
            204: z.object({ name: z.string() }).openapi({ refId: 'Todo' }),
          },
        };

        const generator = getDocumentGenerator('3.0.3', [
          routeWithNamedResponse,
        ]);
        const document = generator.generateDocument({
          info: { title: 'My API', version: '1.0.0' },
        });

        expect(document.components?.schemas).toHaveProperty('Todo');
      });

      it('should provide a default description when one is not available for the status code', () => {
        const routeWithDefaultDescription: RouteDefinition = {
          ...route,
          responses: {
            1234: z.object({}),
          },
        };

        const generator = getDocumentGenerator('3.0.3', [
          routeWithDefaultDescription,
        ]);
        const document = generator.generateDocument({
          info: { title: 'My API', version: '1.0.0' },
        });

        const definition =
          document.paths[reformatPathParams(route.path)][route.method];

        expect(definition.responses['1234'].description).toBe(
          'Unknown response code'
        );
      });
    });
  });
});
