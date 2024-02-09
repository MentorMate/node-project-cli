import { asyncHandler, defineRoute, response } from '@utils/api';
import { todoIdParamSchema, updateTodoSchema, todoSchema } from '../schemas';

export const updateTodoRoute = defineRoute({
  operationId: 'todo-update',
  summary: 'Update a To-Do',
  description: 'Update a To-Do item',
  tags: ['v1', 'Todo'],
  method: 'patch',
  path: '/:id',
  authenticate: true,
  request: {
    params: todoIdParamSchema,
    body: updateTodoSchema,
  },
  responses: {
    200: todoSchema,
    401: response.Unauthorized,
    404: response.NotFound,
    422: response.UnprocessableEntity,
  },
}).attachHandler(
  asyncHandler(async ({ body, params, services, auth: { sub } }, res) => {
    const todo = await services.todosService.update(
      params.id,
      sub,
      body
    );

    res.send(todo);
  })
);
