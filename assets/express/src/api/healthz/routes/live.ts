import { RouteOptions } from 'src/api/intefaces';

export const healthzLive: ReturnType<RouteOptions> = {
  operationId: 'health-liveness',
  tags: ['Healthchecks'],
  method: 'get',
  path: '/live',
  synchronous: true,
  handler: function (_req, res) {
    res.send('OK');
  },
  responses: {
    200: {
      description: 'Liveness endpoint',
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
