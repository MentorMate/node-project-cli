import { models, TodoService } from 'src/modules';
import { response } from '@common';
import { bindRouteOptionsWithSchema } from 'src/api/intefaces';
import { idTodoDTO, replaceTodoDTO } from '../dto';

export default bindRouteOptionsWithSchema(
  ({ todoService }: { todoService: TodoService }) => ({
    operationId: 'todo-replace',
    summary: 'Update a To-Do',
    description: 'Update a To-Do item',
    tags: ['Todo'],
    method: 'put',
    path: '/todos/:id',
    request: {
      params: idTodoDTO,
      body: replaceTodoDTO,
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
