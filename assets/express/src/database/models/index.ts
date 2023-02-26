import usersModelMethods from './user.model';

export const dbFactory = function (dbConnection: unknown) {
  return {
    userDbLayer: usersModelMethods(dbConnection),
    // todosDbLayer: todosModelMethods(dbConnection),
    // ...
  };
};
