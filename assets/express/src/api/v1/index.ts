import { DbCollection } from '@database';
import { defineUserRoutes } from './users';
import { defineTodoRoutes } from './todos';
import { defineAuthRoutes } from './auth';
import {
  initializeUserService,
  initializeTodoService,
  initializeAuthService,
} from '@modules';
import { attachPrefix } from '@common';

export default function (dbCollection: DbCollection) {
  const userService = initializeUserService(dbCollection);
  const todoService = initializeTodoService(dbCollection);
  const authService = initializeAuthService(dbCollection);

  const routes = [
    ...defineUserRoutes({ userService }),
    ...defineTodoRoutes({ todoService }),
    ...defineAuthRoutes({ authService }),
  ];

  return attachPrefix(routes, '/v1');
}
