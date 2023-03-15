import { models, TodoService } from 'src/modules';
import { response } from '@common';
import { bindRouteOptionsWithSchema } from 'src/api/interfaces';
import { idTodoDTO, updateTodoDTO } from '../dto';

export default bindRouteOptionsWithSchema(
  ({ todoService }: { todoService: TodoService }) => ({
    operationId: 'todo-update',
    summary: 'Partially update a To-Do',
    description: 'Partially update a To-Do item',
    tags: ['Todo'],
    method: 'patch',
    path: '/:id',
    request: {
      params: idTodoDTO,
      body: updateTodoDTO,
    },
    responses: {
      200: models.Todo,
      404: response.NotFound(),
      409: response.Conflict(),
      422: response.UnprocessableEntity(),
    },
    handler: async (req, res) => {
      const todo = await todoService.update(req.params.id, req.body);

      res.send(todo);
    },
  })
);
