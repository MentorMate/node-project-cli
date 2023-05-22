import { RouteDefinition } from '@utils/api';

export const helloWorldRoute: RouteDefinition = {
  operationId: 'hello-world',
  summary: 'Hello, World!',
  description: 'Says "Hello, World!"',
  tags: ['Hello World'],
  method: 'get',
  path: '/',
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
