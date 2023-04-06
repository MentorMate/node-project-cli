import { Response } from 'supertest';
import {
  InvalidCredentials,
  TodoNotFound,
  Unauthorized,
  UnprocessableEntity,
  UserConflict,
} from './errors';
import { HttpException } from './http-exception';

const httpExceptionMap = {
  [Unauthorized.name]: Unauthorized(),
  [UnprocessableEntity.name]: UnprocessableEntity(),
  [TodoNotFound.name]: TodoNotFound(),
  [UserConflict.name]: UserConflict(),
  [InvalidCredentials.name]: InvalidCredentials(),
};

export const expectError =
  (ex: (message?: string) => HttpException) => (res: Response) => {
    const error = httpExceptionMap[ex.name];
    expect(res.error).toBeDefined();
    expect(res.body.message).toEqual(error.message);
    expect(res.status).toEqual(error.status);
  };
