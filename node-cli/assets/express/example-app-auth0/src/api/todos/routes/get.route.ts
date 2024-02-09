import { asyncHandler, defineRoute, response } from '@utils/api';
import { todoIdParamSchema, todoSchema } from '../schemas';

export const getTodoRoute = defineRoute({
  operationId: 'todo-get',
  summary: 'Get a To-Do',
  description: 'Get a To-Do item',
  tags: ['v1', 'Todo'],
  method: 'get',
  path: '/:id',
  authenticate: true,
  request: {
    params: todoIdParamSchema,
  },
  responses: {
    200: todoSchema,
    401: response.Unauthorized,
    404: response.NotFound,
    422: response.UnprocessableEntity,
  },
}).attachHandler(
  asyncHandler(async ({ services, params, auth: { payload: { sub } } }, res) => {
    const todo = await services.todosService.find(params.id, sub);

    res.send(todo);
  })
);
