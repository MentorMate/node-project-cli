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
  responses: {
    200: jwtTokensDTO,
    404: response.NotFound(),
    422: response.UnprocessableEntity('Invalid email or password'),
  },
}).attachHandler(
  asyncHandler(async ({ body, services }, res) => {
    const tokens = await services.authService.login(body);

    if (!tokens) {
      throw new createHttpError.UnprocessableEntity(
        'Invalid email or password'
      );
    }

    res.status(200).send(tokens);
  })
);
