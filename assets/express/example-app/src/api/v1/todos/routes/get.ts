import { asyncHandler, defineRoute, response } from '../../../utils';
import { todoIdDTO, todoDTO } from '../dto';

export default defineRoute({
  operationId: 'todo-get',
  summary: 'Get a To-Do',
  description: 'Get a To-Do item',
  tags: ['v1', 'Todo'],
  method: 'get',
  path: '/:id',
  authenticate: true,
  request: {
    params: todoIdDTO,
  },
  responses: {
    200: todoDTO,
    401: response.Unauthorized(),
    404: response.NotFound(),
    422: response.UnprocessableEntity(),
  },
}).attachHandler(
  asyncHandler(async ({ services, params, auth: { sub } }, res) => {
    const todo = await services.todosService.find(params.id, Number(sub));

    res.send(todo);
  })
);
