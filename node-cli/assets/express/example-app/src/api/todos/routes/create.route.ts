import { asyncHandler, defineRoute, response } from '@utils/api';
import { createTodoSchema, todoSchema } from '../schemas';

export const createTodoRoute = defineRoute({
  operationId: 'todo-create',
  summary: 'Create a To-Do',
  description: 'Create a new To-Do item',
  tags: ['v1', 'Todo'],
  method: 'post',
  path: '/',
  authenticate: true,
  request: {
    body: createTodoSchema,
  },
  responses: {
    201: todoSchema,
    401: response.Unauthorized,
    422: response.UnprocessableEntity,
  },
}).attachHandler(
  asyncHandler(async ({ body, services, auth: { sub } }, res) => {
    const todo = await services.todosService.create({
      ...body,
      userId: sub,
    });

    res.status(201).send(todo);
  })
);
