import { RouteOptions } from "@common";

export const healthzReady: RouteOptions = {
    method: 'get',
    url: '/ready',
    middlewares: [],
    handler: async (_req, res) => {
      res.send('OK');
    },

  };

