import { models, UserService } from 'src/modules';
import { bindRouteOptionsWithSchema } from 'src/api/intefaces';
import { paginated } from 'src/database/utils';
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
