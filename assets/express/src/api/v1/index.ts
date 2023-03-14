import { DbCollection } from 'src/database/intefaces';
import { defineUserRoutes } from './users';
import { defineTodoRoutes } from './todos';
import { initializeUserService, initializeTodoService } from 'src/modules';
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
