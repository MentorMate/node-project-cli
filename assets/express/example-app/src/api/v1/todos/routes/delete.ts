import { TodosService } from '@modules/todos';
import { asyncHandler, defineRoute, response } from '../../../utils';
import { todoIdDTO } from '../dto';

export default defineRoute({
  operationId: 'todo-delete',
  summary: 'Delete a To-Do',
  description: 'Delete a To-Do item',
  tags: ['v1', 'Todo'],
  method: 'delete',
  path: '/:id',
  authenticate: true,
  request: {
    params: todoIdDTO,
  },
  inject: [TodosService] as const,
  responses: {
    204: response.NoContent(),
    401: response.Unauthorized(),
    404: response.NotFound(),
    422: response.UnprocessableEntity(),
  },
}).attachHandler(
  asyncHandler(async ({ params, auth: { sub } }, res, _next, todosService) => {
    await todosService.delete(params.id, Number(sub));

    res.status(204).send();
  })
);
