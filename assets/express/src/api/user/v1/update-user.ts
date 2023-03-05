import { updateUserRequestSchema } from "../dto/user.dto";
import { UserRouteOptionsFactory } from "../interfaces";

export const updateUserRouteOptions: UserRouteOptionsFactory<typeof updateUserRequestSchema> = function(userService, middlewares) {
  return {
    method: 'put',
    url: '/',
    middlewares: [middlewares.verifyJWT],
    handler: async function (req, res) {
      const {
        body: { email, ...payload },
        decodedUser,
      } = req;
      if (
        email &&
        (decodedUser?.email === email || decodedUser?.role === 'admin')
      ) {
        const ret = await userService.updateUser({ email, ...payload });
        res.send(ret);
      }

      res.status(401).send({ error: 'Unauthorized' });
    },
  };
}

