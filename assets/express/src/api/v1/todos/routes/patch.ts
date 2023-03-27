import { asyncHandler, defineRoute, response } from '../../../utils';
import { todoIdDTO, todoDTO, updateTodoDTO } from '../dto';

export default defineRoute({
  operationId: 'todo-update',
  summary: 'Partially update a To-Do',
  description: 'Partially update a To-Do item',
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
    404: response.NotFound(),
    409: response.Conflict(),
    422: response.UnprocessableEntity(),
  },
}).attachHandler(
  asyncHandler(async ({ body, params, services }, res) => {
    const todo = await services.todosService.update(params.id, body);

    res.send(todo);
  })
);
