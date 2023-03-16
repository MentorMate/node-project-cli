import { models, UserService } from 'src/modules';
import { response } from '@common';
import { bindRouteOptionsWithSchema } from 'src/api/interfaces';
import { createUserDTO } from '../dto';

export default bindRouteOptionsWithSchema(
  ({ userService }: { userService: UserService }) => ({
    operationId: 'user-create',
    summary: 'Create an User',
    description: 'Create a new User item',
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
      const { ...payload } = req.body;
      const user = await userService.create(payload);

      res.status(201).send(user);
    },
  })
);
