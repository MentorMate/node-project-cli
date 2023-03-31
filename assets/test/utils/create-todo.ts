import request from 'supertest';
import { getTodoPayload } from './get-todo-payload';

export const createTodo = async (
  app: Express.Application,
  idToken: string,
  completed?: boolean
) => {
  return await request(app)
    .post('/v1/todos')
    .set('Authorization', 'Bearer ' + idToken)
    .send(getTodoPayload(completed));
};
