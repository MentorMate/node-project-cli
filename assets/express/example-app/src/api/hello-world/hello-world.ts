import { RouteDefinition } from '../utils';

const route: RouteDefinition = {
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

export default route;
