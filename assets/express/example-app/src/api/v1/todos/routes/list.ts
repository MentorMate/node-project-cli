import { paginated } from '@common/query';
import { todoDTO, todoQueryDTO } from '../dto';
import { asyncHandler, defineRoute, response } from '../../../utils';
import { TodosService } from '@modules/todos';

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
  inject: [TodosService] as const,
  responses: {
    401: response.Unauthorized(),
    200: paginated(todoDTO),
  },
}).attachHandler(
  asyncHandler(async ({ query, auth: { sub } }, res, _next, todosService) => {
    const todos = await todosService.list(Number(sub), query);

    res.send(todos);
  })
);
