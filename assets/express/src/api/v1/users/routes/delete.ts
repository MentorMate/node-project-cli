import { emailUserDTO } from '../dto';
import { response } from '@common';
import { asyncHandler, defineRoute } from '../../../utils';

export default defineRoute({
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
}).attachHandler(
  asyncHandler(async function ({ params, services }, res) {
    await services.userService.delete(params.email);

    res.status(204);
  })
);
