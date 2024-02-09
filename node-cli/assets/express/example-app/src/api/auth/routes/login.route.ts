import createHttpError from 'http-errors';
import { asyncHandler, defineRoute, response } from '@utils/api';
import { credentialsSchema, jwtTokensSchema } from '../schemas';

export const loginRoute = defineRoute({
  operationId: 'login',
  summary: 'Login a user',
  description: 'Authenticate a user',
  tags: ['Auth'],
  method: 'post',
  path: '/login',
  request: {
    body: credentialsSchema,
  },
  responses: {
    200: jwtTokensSchema,
    422: response.UnprocessableEntity,
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
