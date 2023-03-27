import { paginated } from '@common/query';
import { todoDTO, todoQueryDTO } from '../dto';
import { asyncHandler, defineRoute } from '../../../utils';

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
    200: paginated(todoDTO),
  },
}).attachHandler(
  asyncHandler(async ({ query, services }, res) => {
    const todos = await services.todosService.list(query);

    res.send(todos);
  })
);
