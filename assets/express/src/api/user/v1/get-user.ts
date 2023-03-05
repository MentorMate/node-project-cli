import { UserRouteOptionsFactory } from "../interfaces";
import { getOrDeleteUserRequestSchema } from "../dto/user.dto";

export const getUserRouteOptions: UserRouteOptionsFactory<typeof getOrDeleteUserRequestSchema> = function(userService, middlewares) {
  return {
    method: 'get',
    url: '/',
    requestSchema: getOrDeleteUserRequestSchema,
    middlewares: [middlewares.verifyJWT],
    handler: async function (req, res) {
      const {
        query: { email },
        decodedUser,
      } = req;

      if (
        email &&
        (decodedUser?.email === email || decodedUser?.role === 'admin')
      ) {
        const ret = await userService.getUser({ email });

        res.send(ret);
        return;
      }

      if (!email && decodedUser?.role === 'admin') {
        const ret = await userService.getAllUsers();

        res.send(ret);
        return;
      }

      res.status(401).send({ error: 'Unauthorized' });
    },
  };
}

