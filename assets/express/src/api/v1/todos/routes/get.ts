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
    404: response.NotFound(),
    422: response.UnprocessableEntity(),
  },
}).attachHandler(
  asyncHandler(async ({ services, params }, res) => {
    const todo = await services.todosService.find(params.id);

    res.send(todo);
  })
);
