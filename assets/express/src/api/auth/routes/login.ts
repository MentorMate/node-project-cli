import { asyncHandler, defineRoute } from '@api/utils';
import { response } from '@common';
import { models } from '@modules';
import createHttpError from 'http-errors';
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
    200: models.JwtTokens,
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
