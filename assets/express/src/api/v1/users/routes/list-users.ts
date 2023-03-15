import { models, UserService } from '@modules';
import { bindRouteOptionsWithSchema } from '../../../interfaces';
import { paginated } from '@database';
import { userQueryDTO } from '../dto';

export default bindRouteOptionsWithSchema(
  ({ userService }: { userService: UserService }) => ({
    operationId: 'user-list',
    summary: 'List Users',
    description: 'List User items',
    tags: ['User'],
    method: 'get',
    path: '/',
    request: {
      query: userQueryDTO,
    },
    responses: {
      200: paginated(models.User),
    },
    handler: async (req, res) => {
      const todos = await userService.list(req.query);

      res.send(todos);
    },
  })
);
