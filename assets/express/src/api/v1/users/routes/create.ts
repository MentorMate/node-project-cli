import { models } from '@modules';
import { response } from '@common';
import { createUserDTO } from '../dto';
import { asyncHandler, defineRoute } from '../../../utils';

export default defineRoute({
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
}).attachHandler(
  asyncHandler(async ({ body, services }, res) => {
    const user = await services.userService.create(body);

    res.send(user);
  })
);
