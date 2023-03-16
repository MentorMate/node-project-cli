import { response } from '@common';
import { models, AuthService } from '@modules';
import { bindRouteOptionsWithSchema } from '../../../interfaces';
import { loginDTO } from '../dto';

export default bindRouteOptionsWithSchema(
  ({ authService }: { authService: AuthService }) => ({
    operationId: 'login',
    summary: 'Login an user',
    description: 'Authenticate an user',
    tags: ['Auth'],
    method: 'post',
    path: '/login',
    request: {
      body: loginDTO,
    },
    responses: {
      200: models.Auth,
      404: response.NotFound(),
      422: response.UnprocessableEntity(),
    },
    handler: async (req, res) => {
      const { ...payload } = req.body;
      const ret = authService.login(payload);

      res.send(ret);
    },
  })
);
