import { response } from '@common';
import { idTodoDTO } from '../dto';
import { asyncHandler, defineRoute } from '../../../utils';

export default defineRoute({
  operationId: 'todo-delete',
  summary: 'Delete a To-Do',
  description: 'Soft delete a To-Do item',
  tags: ['v1', 'Todo'],
  method: 'delete',
  path: '/:id',
  authenticate: true,
  request: {
    params: idTodoDTO,
  },
  responses: {
    204: response.NoContent(),
    404: response.NotFound(),
    422: response.UnprocessableEntity(),
  },
}).attachHandler(
  asyncHandler(async ({ params, services }, res) => {
    await services.todosService.delete(params.id);

    res.status(204).send();
  })
);
