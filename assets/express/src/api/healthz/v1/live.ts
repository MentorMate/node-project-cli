import { RouteOptions } from "@common";

export const healthzLive: RouteOptions = {
    method: 'get',
    url: '/live',
    middlewares: [],
    handler: async (_req, res) => {
      res.send('OK');
    },

  };

