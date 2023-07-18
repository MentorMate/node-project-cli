import { RouteDefinition } from '@utils/api';

export const readinessRoute: RouteDefinition = {
  operationId: 'health-readiness',
  summary: 'Readiness endpoint',
  description:
    'Used to check whether the application is ready to receive requests.',
  tags: ['Healthchecks'],
  method: 'get',
  path: '/ready',
  handler: function (_req, res) {
    // Add your specific checks
    res.send('OK');
  },
  responses: {
    200: {
      description: 'Application is ready',
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
