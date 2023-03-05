import { DbCollection } from '../interfaces';
import usersModelMethods from './user.model';

export const dbFactory = function (dbConnection: unknown): DbCollection {
  return {
    userRepoitory: usersModelMethods(dbConnection),
    // todosDbLayer: todosModelMethods(dbConnection),
    // ...
  };
};
