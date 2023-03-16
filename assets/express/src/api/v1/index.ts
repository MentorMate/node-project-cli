import { DbCollection } from '@database';
import { defineUserRoutes } from './users';
import { defineTodoRoutes } from './todos';
import { initializeUserService, initializeTodoService } from '@modules';
import { attachPrefix } from '@common';

export default function (dbCollection: DbCollection) {
  const userService = initializeUserService(dbCollection);
  const todoService = initializeTodoService(dbCollection);

  const routes = [
    ...defineUserRoutes({ userService }),
    ...defineTodoRoutes({ todoService }),
  ];

  return attachPrefix(routes, '/v1');
}
