import { bindRouteOptionsWithSchema } from 'src/api/intefaces';
import { emailUserDTO, replaceUserDTO } from '../dto';
import { response } from '@common';
import { models, UserService } from 'src/modules';

export default bindRouteOptionsWithSchema(
  ({ userService }: { userService: UserService }) => ({
    operationId: 'user-replace',
    summary: 'Update an User',
    description: 'Update an User item',
    tags: ['User'],
    method: 'put',
    path: '/:email',
    request: {
      params: emailUserDTO,
      body: replaceUserDTO,
    },
    responses: {
      200: models.User,
      404: response.NotFound(),
      409: response.Conflict(),
      422: response.UnprocessableEntity(),
    },
    handler: async function (req, res) {
      const user = await userService.update(req.params.email, req.body);

      res.send(user);
    },
  })
);
