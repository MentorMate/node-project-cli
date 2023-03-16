import { RouteOptions } from '../../interfaces';

export const helloWorld: ReturnType<RouteOptions> = {
  operationId: 'hello-world',
  summary: 'Hello, World!',
  description: 'Says "Hello, World!"',
  method: 'get',
  path: '/',
  synchronous: true,
  handler: function (_req, res) {
    res.send('Hello, World!');
  },
  responses: {
    200: {
      description: 'Says hi.',
      content: {
        'text/plain': {
          schema: {
            type: 'string',
            example: 'Hello, World!',
          },
        },
      },
    },
  },
};
