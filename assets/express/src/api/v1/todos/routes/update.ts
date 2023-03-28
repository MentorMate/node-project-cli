import { asyncHandler, defineRoute, response } from '../../../utils';
import { todoIdDTO, updateTodoDTO, todoDTO } from '../dto';

export default defineRoute({
  operationId: 'todo-update',
  summary: 'Update a To-Do',
  description: 'Update a To-Do item',
  tags: ['v1', 'Todo'],
  method: 'patch',
  path: '/:id',
  authenticate: true,
  request: {
    params: todoIdDTO,
    body: updateTodoDTO,
  },
  responses: {
    200: todoDTO,
    401: response.Unauthorized(),
    404: response.NotFound(),
    409: response.Conflict(),
    422: response.UnprocessableEntity(),
  },
}).attachHandler(
  asyncHandler(async ({ body, params, services, auth: { sub } }, res) => {
    const todo = await services.todosService.update(
      params.id,
      Number(sub),
      body
    );

    res.send(todo);
  })
);
