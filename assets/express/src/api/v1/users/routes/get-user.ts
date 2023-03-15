import { bindRouteOptionsWithSchema } from 'src/api/interfaces';
import { emailUserDTO } from '../dto';
import { response } from '@common';
import { models, UserService } from 'src/modules';

export default bindRouteOptionsWithSchema(
  ({ userService }: { userService: UserService }) => ({
    operationId: 'user-get',
    summary: 'Get an User',
    description: 'Get an User item',
    tags: ['User'],
    method: 'get',
    path: '/:email',
    request: {
      params: emailUserDTO,
    },
    responses: {
      200: models.User,
      404: response.NotFound(),
      422: response.UnprocessableEntity(),
    },
    handler: async function (req, res) {
      const user = await userService.find(req.params.email);

      res.send(user);
    },
  })
);
