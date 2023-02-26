import { DbLayerCollection } from '@database/interfaces';
import { userModuleFactory } from './user';
import { MiddlewareCollection, ApiRoutesDefinition } from './user/interfaces';

export const apiDefinitionFactory = function (
  dbLayers: DbLayerCollection,
  middlewares: MiddlewareCollection
): ApiRoutesDefinition {
  return {
    users: userModuleFactory(dbLayers, middlewares),
    // todos: todosModuleFactory(dbLayers, middlewares)
  };
};
