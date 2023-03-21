import { DbCollection } from '@database';
import { defineUserRoutes } from './users';
import { defineTodoRoutes } from './todos';
import { defineAuthRoutes } from './auth';
import {
  initializeUserService,
  initializeTodoService,
  AuthService,
} from '@modules';
import { attachPrefix } from '@common';

export default function (dbCollection: DbCollection, authService: AuthService) {
  const userService = initializeUserService(dbCollection);
  const todoService = initializeTodoService(dbCollection);

  const routes = [
    ...defineUserRoutes({ userService }),
    ...defineTodoRoutes({ todoService }),
    ...defineAuthRoutes({ authService }),
  ];

  return attachPrefix(routes, '/v1');
}
