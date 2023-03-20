import { DbCollection } from '@database';
import { defineUserRoutes } from './users';
import { defineTodoRoutes } from './todos';
import { initializeUserService, initializeTodoService } from '@modules';
import { prefixRoutes } from '../utils';

export default function (dbCollection: DbCollection) {
  const userService = initializeUserService(dbCollection);
  const todoService = initializeTodoService(dbCollection);

  const routes = [
    ...defineUserRoutes({ userService }),
    ...defineTodoRoutes({ todoService }),
  ];

  return prefixRoutes('/v1', routes);
}
