import { models } from '@modules';
import { response } from '@common';
import { emailUserDTO, updateUserDTO } from '../dto';
import { asyncHandler, defineRoute } from '../../../utils';

export default defineRoute({
  operationId: 'user-update',
  summary: 'Partially update an User',
  description: 'Partially update an User item',
  tags: ['User'],
  method: 'patch',
  path: '/:email',
  authenticate: true,
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
}).attachHandler(
  asyncHandler(async ({ body, params, services }, res) => {
    const user = await services.userService.update(params.email, body);

    res.send(user);
  })
);
