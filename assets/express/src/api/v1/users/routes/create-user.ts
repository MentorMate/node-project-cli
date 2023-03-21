import { models, UserService } from '@modules';
import { response } from '@common';
import { bindRouteOptionsWithSchema } from '../../../interfaces';
import { createUserDTO } from '../dto';

export default bindRouteOptionsWithSchema(
  ({ userService }: { userService: UserService }) => ({
    operationId: 'user-create',
    summary: 'Create a user',
    description: 'Create a new user',
    tags: ['User'],
    method: 'post',
    path: '/',
    request: {
      body: createUserDTO,
    },
    responses: {
      201: models.User,
      409: response.Conflict(),
      422: response.UnprocessableEntity(),
    },
    handler: async (req, res) => {
      const user = await userService.create(req.body);
      res.status(201).send(user);
    },
  })
);
