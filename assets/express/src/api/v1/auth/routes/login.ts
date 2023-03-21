import { asyncHandler, defineRoute } from '@app/api/utils';
import { response } from '@common';
import { models } from '@modules';
import { loginDTO } from '../dto';

export default defineRoute({
  operationId: 'login',
  summary: 'Login a user',
  description: 'Authenticate a user',
  tags: ['Auth'],
  method: 'post',
  path: '/login',
  request: {
    body: loginDTO,
  },
  responses: {
    200: models.Auth,
    404: response.NotFound(),
    422: response.Unauthorized(),
  },
}).attachHandler(
  asyncHandler(async ({ body, services }, res) => {
    const tokens = await services.authService.login(body);
    res.status(200).send(tokens);
  })
);
