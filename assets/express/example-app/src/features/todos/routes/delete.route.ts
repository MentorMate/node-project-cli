import { asyncHandler, defineRoute, response } from '@utils/api';
import { todoIdParamSchema } from '../schemas';

export const deleteTodoRoute = defineRoute({
  operationId: 'todo-delete',
  summary: 'Delete a To-Do',
  description: 'Delete a To-Do item',
  tags: ['v1', 'Todo'],
  method: 'delete',
  path: '/:id',
  authenticate: true,
  request: {
    params: todoIdParamSchema,
  },
  responses: {
    204: response.NoContent,
    401: response.Unauthorized,
    404: response.NotFound,
    422: response.UnprocessableEntity,
  },
}).attachHandler(
  asyncHandler(async ({ params, services, auth: { sub } }, res) => {
    await services.todosService.delete(params.id, Number(sub));

    res.status(204).send();
  })
);
