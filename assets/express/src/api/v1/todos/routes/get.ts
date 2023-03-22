import { models } from '@modules';
import { response } from '@common';
import { idTodoDTO } from '../dto';
import { asyncHandler, defineRoute } from '../../../utils';

export default defineRoute({
  operationId: 'todo-get',
  summary: 'Get a To-Do',
  description: 'Get a To-Do item',
  tags: ['Todo'],
  method: 'get',
  path: '/:id',
  authenticate: true,
  request: {
    params: idTodoDTO,
  },
  responses: {
    200: models.Todo,
    404: response.NotFound(),
    422: response.UnprocessableEntity(),
  },
}).attachHandler(
  asyncHandler(async ({ services, params }, res) => {
    const todo = await services.todoService.find(params.id);

    res.send(todo);
  })
);
