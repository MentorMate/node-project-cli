import {
  GenericRequestHandler,
  RequestSchema,
  RouteDefinition,
} from './interfaces';

/**
 * A utility function that does the `.catch(next)` for you.
 * This is, basically, `express-async-handler`: https://github.com/Abazhenov/express-async-handler/blob/master/index.js
 *
 * Example:
 * ```
 * // this
 * function (req, res, next) {
 *   service.create(req.body)
 *     .then(record => res.status(201).send(record))
 *     .catch(next);
 * }
 *
 * // turns into
 * asyncHandler(async function(req, res) {
 *   const todo = await service.create(req.body);
 *   res.status(201).send(todo);
 * })
 * ```
 */
export const asyncHandler = <
  S extends RequestSchema,
  H extends GenericRequestHandler<S>
>(
  handler: H
): GenericRequestHandler<S> => {
  return function (req, res, next) {
    const result = handler(req, res, next);
    return Promise.resolve(result).catch(next);
  };
};

export const prefixRoute = (prefix: string, route: RouteDefinition<any>) => ({
  ...route,
  path: `${prefix}${route.path}`,
});

export const prefixRoutes = (prefix: string, routes: RouteDefinition<any>[]) =>
  routes.map((route) => prefixRoute(prefix, route));

export const defineRoute = <T extends RequestSchema>(
  route: Omit<RouteDefinition<T>, 'handler'>
) => ({
  attachHandler: (
    handler: RouteDefinition<T>['handler']
  ): RouteDefinition<T> => ({
    ...route,
    handler,
  }),
});
