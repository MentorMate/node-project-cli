import { createTodoDTO, todoDTO } from '../dto';
import { asyncHandler, defineRoute, response } from '../../../utils';
import { TodosService } from '@modules/todos';

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
  inject: [TodosService] as const,
  responses: {
    201: todoDTO,
    401: response.Unauthorized(),
    422: response.UnprocessableEntity(),
  },
}).attachHandler(
  asyncHandler(async ({ body, auth: { sub } }, res, _next, todosService) => {
    const todo = await todosService.create({
      ...body,
      userId: Number(sub),
    });

    res.status(201).send(todo);
  })
);
