import { asyncHandler, defineRoute, response } from '../../../utils';
import { todoIdDTO, replaceTodoDTO, todoDTO } from '../dto';

export default defineRoute({
  operationId: 'todo-replace',
  summary: 'Update a To-Do',
  description: 'Update a To-Do item',
  tags: ['v1', 'Todo'],
  method: 'put',
  path: '/:id',
  authenticate: true,
  request: {
    params: todoIdDTO,
    body: replaceTodoDTO,
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
