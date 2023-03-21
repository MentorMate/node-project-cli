import { response } from '@common';
import { models, AuthService } from '@modules';
import { bindRouteOptionsWithSchema } from '../../../interfaces';
import { loginDTO } from '../dto';

export default bindRouteOptionsWithSchema(
  ({ authService }: { authService: AuthService }) => ({
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
    handler: async (req, res) => {
      const tokens = await authService.login(req.body);
      res.status(200).send(tokens);
    },
  })
);
