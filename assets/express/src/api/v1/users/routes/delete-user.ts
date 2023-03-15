import { bindRouteOptionsWithSchema } from 'src/api/interfaces';
import { emailUserDTO } from '../dto';
import { response } from '@common';
import { UserService } from 'src/modules';

export default bindRouteOptionsWithSchema(
  ({ userService }: { userService: UserService }) => ({
    operationId: 'user-delete',
    summary: 'Delete an User',
    description: 'Soft delete an User item',
    tags: ['User'],
    method: 'delete',
    path: '/:email',
    request: {
      params: emailUserDTO,
    },
    responses: {
      204: response.NoContent(),
      404: response.NotFound(),
      422: response.UnprocessableEntity(),
    },
    handler: async function (req, res) {
      await userService.delete(req.params.email);

      res.status(204);
    },
  })
);
