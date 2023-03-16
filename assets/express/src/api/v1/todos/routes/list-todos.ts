import { models, TodoService } from '@modules';
import { bindRouteOptionsWithSchema } from '../../../interfaces';
import { paginated } from '@database';
import { todoQueryDTO } from '../dto';

export default bindRouteOptionsWithSchema(
  ({ todoService }: { todoService: TodoService }) => ({
    operationId: 'todo-list',
    summary: 'List To-Dos',
    description: 'List To-Do items',
    tags: ['Todo'],
    method: 'get',
    path: '/',
    request: {
      query: todoQueryDTO,
    },
    responses: {
      200: paginated(models.Todo),
    },
    handler: async (req, res) => {
      const todos = await todoService.list(req.query);

      res.send(todos);
    },
  })
);
