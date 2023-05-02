import { asyncHandler, defineRoute, response } from '@common/api';
import { createTodoDTO, todoDTO } from '../dto';

export default defineRoute({
  operationId: 'todo-create',
  summary: 'Create a To-Do',
  description: 'Create a new To-Do item',
  tags: ['v1', 'Todo'],
  method: 'post',
  path: '/',
  authenticate: true,
  request: {
    body: createTodoDTO,
  },
  responses: {
    201: todoDTO,
    401: response.Unauthorized(),
    422: response.UnprocessableEntity(),
  },
}).attachHandler(
  asyncHandler(async ({ body, services, auth: { sub } }, res) => {
    const todo = await services.todosService.create({
      ...body,
      userId: Number(sub),
    });

    res.status(201).send(todo);
  })
);
