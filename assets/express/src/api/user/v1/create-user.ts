import { UserRouteOptionsFactory } from "../interfaces";
import { createUserRequestSchema } from "../dto/user.dto";

export const createUserRouteOptions: UserRouteOptionsFactory<typeof createUserRequestSchema> = function(userService) {
  return {
    method: 'post',
    url: '/sign-up',
    requestSchema: createUserRequestSchema,
    middlewares: [],
    handler: async (req, res) => {
      const { ...payload } = req.body;
      console.log({ payload });
      const ret = userService.createUser(payload);
      console.log({ ret });

      res.send(ret);
    },

  };
}

