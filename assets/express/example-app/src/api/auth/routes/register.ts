import { AuthService } from '@modules/auth';
import { asyncHandler, defineRoute, response } from '../../utils';
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
  inject: [AuthService] as const,
  responses: {
    200: jwtTokensDTO,
    409: response.Conflict(),
    422: response.UnprocessableEntity(),
  },
}).attachHandler(
  asyncHandler(async ({ body }, res, _next, authService) => {
    const tokens = await authService.register(body);
    res.status(200).send(tokens);
  })
);
