import { response } from '@common';
import { models, AuthService } from '@modules';
import { bindRouteOptionsWithSchema } from '../../../interfaces';
import { registerDTO } from '../dto';

export default bindRouteOptionsWithSchema(
  ({ authService }: { authService: AuthService }) => ({
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
      200: models.Auth,
      409: response.Conflict(),
      422: response.UnprocessableEntity(),
    },
    handler: async (req, res) => {
      const tokens = await authService.register(req.body);
      res.status(200).send(tokens);
    },
  })
);
