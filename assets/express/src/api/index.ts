import { AuthService } from '@app/modules';
import { DbCollection } from '@database';
import healtz from './healthz';
import helloWorld from './hello-world';
import { RouteDefinition } from './interfaces';
import defineV1Routes from './v1';

export * from './utils';

export default function (
  dbCollection: DbCollection,
  authService: AuthService
): RouteDefinition<any>[] {
  return [
    ...helloWorld,
    ...healtz,
    ...defineV1Routes(dbCollection, authService),
  ];
}
