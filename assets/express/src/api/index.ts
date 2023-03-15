import { DbCollection } from '@database';
import { defineHealthzRoutes } from './healthz';
import { RouteDefinition } from './interfaces';
import defineV1Routes from './v1';

export default function (dbCollection: DbCollection): RouteDefinition<any>[] {
  return [...defineHealthzRoutes(), ...defineV1Routes(dbCollection)];
}
