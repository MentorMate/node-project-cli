import { defineRoute, prefixRoute, prefixRoutes } from './route';

describe('prefixRoute', () => {
  it("should prefix the route's path", () => {
    expect(prefixRoute('/users', { path: '/create' }).path).toBe(
      '/users/create'
    );
  });
});

describe('prefixRoutes', () => {
  it("should prefix the routes' path", () => {
    const routes = [{ path: '/create' }, { path: '/update' }];

    expect(prefixRoutes('/users', routes)).toEqual([
      { path: '/users/create' },
      { path: '/users/update' },
    ]);
  });
});

describe('defineRoute', () => {
  it('should return an object with a attachHandler function', () => {
    const routeDefinition = {};
    const result = defineRoute(routeDefinition as never);
    expect(result).toHaveProperty('attachHandler');
    expect(result.attachHandler).toBeInstanceOf(Function);
  });

  describe('attachHandler', () => {
    it('should add a handler property to the route definition', () => {
      const routeDefinition = {};
      const handler = () => undefined;
      const route = defineRoute(routeDefinition as never).attachHandler(
        handler
      );
      expect(route.handler).toBe(handler);
    });
  });
});
