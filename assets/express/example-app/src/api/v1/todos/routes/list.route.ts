import { asyncHandler, defineRoute, response } from '@common/api';
import { paginated } from '@common/query';
import { todoDTO, todoQueryDTO } from '../dto';

export default defineRoute({
  operationId: 'todo-list',
  summary: 'List To-Dos',
  description: 'List To-Do items',
  tags: ['v1', 'Todo'],
  method: 'get',
  path: '/',
  authenticate: true,
  request: {
    query: todoQueryDTO,
  },
  responses: {
    401: response.Unauthorized(),
    200: paginated(todoDTO),
  },
}).attachHandler(
  asyncHandler(async ({ query, services, auth: { sub } }, res) => {
    const todos = await services.todosService.list(Number(sub), query);

    res.send(todos);
  })
);
