import { response } from '@common';
import { models } from '@modules';
import { emailUserDTO, replaceUserDTO } from '../dto';
import { asyncHandler, defineRoute } from '../../../utils';

export default defineRoute({
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
}).attachHandler(
  asyncHandler(async function ({ body, params, services }, res) {
    const user = await services.userService.update(params.email, body);

    res.send(user);
  })
);
