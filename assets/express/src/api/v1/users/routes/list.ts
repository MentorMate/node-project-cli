import { models } from '@modules';
import { paginated } from '@database';
import { userQueryDTO } from '../dto';
import { asyncHandler, defineRoute } from '../../../utils';

export default defineRoute({
  operationId: 'user-list',
  summary: 'List Users',
  description: 'List User items',
  tags: ['User'],
  method: 'get',
  path: '/',
  authenticate: true,
  request: {
    query: userQueryDTO,
  },
  responses: {
    200: paginated(models.User),
  },
}).attachHandler(
  asyncHandler(async ({ query, services }, res) => {
    const todos = await services.userService.list(query);

    res.send(todos);
  })
);
