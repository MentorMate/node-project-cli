import { asyncHandler, defineRoute, response } from '@utils/api';
import { paginated } from '@utils/query';
import { todoSchema, listTodosQuerySchema } from '../schemas';

export const listTodosRoute = defineRoute({
  operationId: 'todo-list',
  summary: 'List To-Dos',
  description: 'List To-Do items',
  tags: ['v1', 'Todo'],
  method: 'get',
  path: '/',
  authenticate: true,
  request: {
    query: listTodosQuerySchema,
  },
  responses: {
    401: response.Unauthorized,
    200: paginated(todoSchema),
  },
}).attachHandler(
  asyncHandler(
    async (
      {
        query,
        services,
        auth: {
          payload: { sub },
        },
      },
      res
    ) => {
      const todos = await services.todosService.list(sub, query);

      res.send(todos);
    }
  )
);
