import { RouteOptions } from 'src/api/intefaces';

export const healthzReady: ReturnType<RouteOptions> = {
  operationId: 'health-readiness',
  tags: ['Healthchecks'],
  method: 'get',
  path: '/healthz/ready',
  responses: {
    200: {
      description: 'Readiness endpoint',
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
  synchronous: true,
  handler: function (_req, res) {
    res.send('OK');
  },
};
