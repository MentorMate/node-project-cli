import { emailUserDTO } from '../dto';
import { response } from '@common';
import { models } from '@modules';
import { asyncHandler, defineRoute } from '../../../utils';

export default defineRoute({
  operationId: 'user-get',
  summary: 'Get an User',
  description: 'Get an User item',
  tags: ['User'],
  method: 'get',
  path: '/:email',
  authenticate: true,
  request: {
    params: emailUserDTO,
  },
  responses: {
    200: models.User,
    404: response.NotFound(),
    422: response.UnprocessableEntity(),
  },
}).attachHandler(
  asyncHandler(async function ({ params, services }, res) {
    const user = await services.userService.find(params.email);

    res.send(user);
  })
);
