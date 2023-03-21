import { RouteDefinition } from '../interfaces';

const route: RouteDefinition = {
  operationId: 'health-liveness',
  summary: 'Liveness endpoint',
  description: 'Used to check whether the application is alive.',
  tags: ['Healthchecks'],
  method: 'get',
  path: '/live',
  handler: function (_req, res) {
    res.send('OK');
  },
  responses: {
    200: {
      description: 'Application is alive',
      content: {
        'text/plain': {
          schema: {
            type: 'string',
            example: 'OK',
          },
        },
      },
    },
  },
};

export default route;
