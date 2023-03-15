import { TodoService } from 'src/modules';
import { response } from '@common';
import { bindRouteOptionsWithSchema } from 'src/api/interfaces';
import { idTodoDTO } from '../dto';

export default bindRouteOptionsWithSchema(
  ({ todoService }: { todoService: TodoService }) => ({
    operationId: 'todo-delete',
    summary: 'Delete a To-Do',
    description: 'Soft delete a To-Do item',
    tags: ['Todo'],
    method: 'delete',
    path: '/:id',
    request: {
      params: idTodoDTO,
    },
    responses: {
      204: response.NoContent(),
      404: response.NotFound(),
      422: response.UnprocessableEntity(),
    },
    handler: async (req, res) => {
      await todoService.delete(req.params.id);

      res.status(204).send();
    },
  })
);
