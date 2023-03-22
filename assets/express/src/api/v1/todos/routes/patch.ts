import { models } from '@modules';
import { response } from '@common';
import { idTodoDTO, updateTodoDTO } from '../dto';
import { asyncHandler, defineRoute } from '../../../utils';

export default defineRoute({
  operationId: 'todo-update',
  summary: 'Partially update a To-Do',
  description: 'Partially update a To-Do item',
  tags: ['Todo'],
  method: 'patch',
  path: '/:id',
  authenticate: true,
  request: {
    params: idTodoDTO,
    body: updateTodoDTO,
  },
  responses: {
    200: models.Todo,
    404: response.NotFound(),
    409: response.Conflict(),
    422: response.UnprocessableEntity(),
  },
}).attachHandler(
  asyncHandler(async ({ body, params, services }, res) => {
    const todo = await services.todoService.update(params.id, body);

    res.send(todo);
  })
);
