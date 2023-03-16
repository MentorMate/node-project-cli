import { models, TodoService } from '@modules';
import { response } from '@common';
import { bindRouteOptionsWithSchema } from '../../../interfaces';
import { idTodoDTO } from '../dto';

export default bindRouteOptionsWithSchema(
  ({ todoService }: { todoService: TodoService }) => ({
    operationId: 'todo-get',
    summary: 'Get a To-Do',
    description: 'Get a To-Do item',
    tags: ['Todo'],
    method: 'get',
    path: '/:id',
    request: {
      params: idTodoDTO,
    },
    responses: {
      200: models.Todo,
      404: response.NotFound(),
      422: response.UnprocessableEntity(),
    },
    handler: async (req, res) => {
      const todo = await todoService.find(req.params.id);

      res.send(todo);
    },
  })
);
