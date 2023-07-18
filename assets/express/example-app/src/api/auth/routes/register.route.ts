import { asyncHandler, defineRoute, response } from '@utils/api';
import { credentialsSchema, jwtTokensSchema } from '../schemas';

export const registerRoute = defineRoute({
  operationId: 'register',
  summary: 'Register a user',
  description: 'Register a user',
  tags: ['Auth'],
  method: 'post',
  path: '/register',
  request: {
    body: credentialsSchema,
  },
  responses: {
    200: jwtTokensSchema,
    409: response.Conflict,
    422: response.UnprocessableEntity,
  },
}).attachHandler(
  asyncHandler(async ({ body, services }, res) => {
    const tokens = await services.authService.register(body);
    res.status(200).send(tokens);
  })
);
