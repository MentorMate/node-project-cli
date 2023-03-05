import { ModuleFactory } from '@common';
import { userServiceFactory } from '@services';
import { UserController } from './interfaces';
import { userControllerFactory } from './v1';

export * from './interfaces'

export const userModuleFactory: ModuleFactory<
  UserController
> = function ({ userRepoitory }) {
  const userService = userServiceFactory(userRepoitory);

  return userControllerFactory(userService);
};
