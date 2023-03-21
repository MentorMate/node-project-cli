import { models } from '@modules';
import { response } from '@common';
import { idTodoDTO, replaceTodoDTO } from '../dto';
import { asyncHandler, defineRoute } from '../../../utils';

export default defineRoute({
  operationId: 'todo-replace',
  summary: 'Update a To-Do',
  description: 'Update a To-Do item',
  tags: ['Todo'],
  method: 'put',
  path: '/:id',
  request: {
    params: idTodoDTO,
    body: replaceTodoDTO,
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
