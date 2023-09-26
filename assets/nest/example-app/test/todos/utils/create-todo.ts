import { Todo } from '@api/todos/entities/todo.entity';
import { getTodoPayload } from './get-todo-payload';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export const createTodo = async (
  app: NestFastifyApplication,
  idToken: string,
  completed?: boolean,
) => {
  const res = await app.inject({
    method: 'POST',
    url: '/v1/todos',
    payload: getTodoPayload(completed),
    headers: {
      authorization: `Bearer ${idToken}`,
    },
  });

  return JSON.parse(res.body) as Todo;
};
