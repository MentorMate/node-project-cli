import { DbCollection } from 'src/database/intefaces';
import { defineHealthzRoutes } from './healthz';
import { RouteDefinition } from './intefaces';
import defineV1Routes from './v1';

export default function (dbCollection: DbCollection): RouteDefinition<any>[] {
  return [...defineHealthzRoutes(), ...defineV1Routes(dbCollection)];
}
