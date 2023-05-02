import { asyncHandler, defineRoute, response } from '@common/api';
import { jwtTokensDTO, registerDTO } from '../dto';

export default defineRoute({
  operationId: 'register',
  summary: 'Register a user',
  description: 'Register a user',
  tags: ['Auth'],
  method: 'post',
  path: '/register',
  request: {
    body: registerDTO,
  },
  responses: {
    200: jwtTokensDTO,
    409: response.Conflict(),
    422: response.UnprocessableEntity(),
  },
}).attachHandler(
  asyncHandler(async ({ body, services }, res) => {
    const tokens = await services.authService.register(body);
    res.status(200).send(tokens);
  })
);
