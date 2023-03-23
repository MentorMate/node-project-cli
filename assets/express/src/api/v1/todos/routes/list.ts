import { models } from '@modules';
import { paginated } from '@common/query';
import { todoQueryDTO } from '../dto';
import { asyncHandler, defineRoute } from '../../../utils';

export default defineRoute({
  operationId: 'todo-list',
  summary: 'List To-Dos',
  description: 'List To-Do items',
  tags: ['Todo'],
  method: 'get',
  path: '/',
  authenticate: true,
  request: {
    query: todoQueryDTO,
  },
  responses: {
    200: paginated(models.Todo),
  },
}).attachHandler(
  asyncHandler(async ({ query, services }, res) => {
    const todos = await services.todoService.list(query);

    res.send(todos);
  })
);
