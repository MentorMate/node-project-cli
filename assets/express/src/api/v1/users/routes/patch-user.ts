import { models, UserService } from '@modules';
import { response } from '@common';
import { bindRouteOptionsWithSchema } from '../../../interfaces';
import { emailUserDTO, updateUserDTO } from '../dto';

export default bindRouteOptionsWithSchema(
  ({ userService }: { userService: UserService }) => ({
    operationId: 'user-update',
    summary: 'Partially update an User',
    description: 'Partially update an User item',
    tags: ['User'],
    method: 'patch',
    path: '/:email',
    request: {
      params: emailUserDTO,
      body: updateUserDTO,
    },
    responses: {
      200: models.User,
      404: response.NotFound(),
      409: response.Conflict(),
      422: response.UnprocessableEntity(),
    },
    handler: async (req, res) => {
      const user = await userService.update(req.params.email, req.body);

      res.send(user);
    },
  })
);
