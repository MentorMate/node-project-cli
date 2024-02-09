import { asyncHandler, defineRoute } from '@utils/api';
import { UserSchema, credentialsSchema } from '../schemas';

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
    200: UserSchema
  },
}).attachHandler(
  asyncHandler(async ({ body, services }, res) => {
    const user = await services.authService.register(body);
    res.status(200).send(user);
  })
);
