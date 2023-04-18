import { AuthService } from '@modules/auth';
import createHttpError from 'http-errors';
import { asyncHandler, defineRoute, response } from '../../utils';
import { jwtTokensDTO, loginDTO } from '../dto';

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
  inject: [AuthService] as const,
  responses: {
    200: jwtTokensDTO,
    422: response.UnprocessableEntity('Invalid email or password'),
  },
}).attachHandler(
  asyncHandler(async ({ body }, res, _next, authService) => {
    const tokens = await authService.login(body);

    if (!tokens) {
      throw new createHttpError.UnprocessableEntity(
        'Invalid email or password'
      );
    }

    res.status(200).send(tokens);
  })
);
