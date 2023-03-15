import { models, TodoService } from 'src/modules';
import { bindRouteOptionsWithSchema } from 'src/api/intefaces';
import { paginated } from 'src/database/utils';
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
