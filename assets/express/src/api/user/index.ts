import { userServiceFactory } from './v1/user.service';
import { userControllerFactory } from './v1/user.controller';
import * as helpers from './helpers';
import { User, UserPayload } from '@entities';
import { ModuleFactory } from '@common';
import { UserController, MiddlewareCollection } from './interfaces';

export const userModuleFactory: ModuleFactory<
  { id: string; payload: UserPayload; entity: User },
  UserController,
  MiddlewareCollection
> = function ({ userDbLayer }, middlewares) {
  const userService = userServiceFactory(userDbLayer, helpers);

  return userControllerFactory(userService, middlewares);
};
