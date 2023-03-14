import { createTodoDTO } from '../dto';
import { bindRouteOptionsWithSchema } from '../../../intefaces';
import { models, TodoService } from '@modules';
import { response } from '@common';

export default bindRouteOptionsWithSchema(
  ({ todoService }: { todoService: TodoService }) => ({
    operationId: 'todo-create',
    summary: 'Create a To-Do',
    description: 'Create a new To-Do item',
    tags: ['Todo'],
    method: 'post',
    path: '/',
    request: {
      body: createTodoDTO,
    },
    responses: {
      201: models.Todo,
      409: response.Conflict(),
      422: response.UnprocessableEntity(),
    },
    handler: async (req, res) => {
      const todo = await todoService.create(req.body);

      res.status(201).send(todo);
    },
  })
);
