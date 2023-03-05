import { DbCollection } from '@database';
import { HealthzController, healthzModuleFactory } from './healthz';
import { UserController,  userModuleFactory } from './user';

export interface ApiRoutesDefinition extends Record<string, object> {
  healthz: HealthzController;
  users: UserController;
  // todos: TodosController
}

export type ApiRoutes = UserController[keyof UserController] | HealthzController[keyof HealthzController]

export const apiDefinitionFactory = function (
  dbCollection: DbCollection,
): ApiRoutesDefinition {
  return {
    healthz: healthzModuleFactory(),
    users: userModuleFactory(dbCollection),
    // todos: todosModuleFactory(dbCollection)
  };
};
