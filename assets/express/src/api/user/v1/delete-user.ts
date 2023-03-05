import { getOrDeleteUserRequestSchema } from "../dto/user.dto";
import { UserRouteOptionsFactory } from "../interfaces";

export const deleteUserRouteOptions: UserRouteOptionsFactory<typeof getOrDeleteUserRequestSchema> = function(userService, middlewares) {
  return {
    method: 'delete',
    url: '/',
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
        const ret = await userService.deleteUser({ email });
        res.send(ret);
      }

      res.status(401).send({ error: 'Unauthorized' });
    },
  };
}

