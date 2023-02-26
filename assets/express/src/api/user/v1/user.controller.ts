import { ControllerFactory, RouteOptions } from '@common';
import {
  createUserRequestSchema,
  getOrDeleteUserRequestSchema,
  loginUserRequestSchema,
  updateUserRequestSchema,
} from '../dto/user.dto';
import {
  UserService,
  UserController,
  getUserRequestPayload,
  loginUserRequestPayload,
  createUserRequestPayload,
  updateUserRequestPayload,
  deleteUserRequestPayload,
  MiddlewareCollection,
} from '../interfaces';

export const userControllerFactory: ControllerFactory<
  UserService,
  UserController,
  MiddlewareCollection
> = function userController(userService, { verifyJWT, validateRequest }) {
  const getUser: RouteOptions<{ query: getUserRequestPayload }> = {
    method: 'get',
    url: '/',
    middlewares: [validateRequest(getOrDeleteUserRequestSchema), verifyJWT],
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

  const loginUser: RouteOptions<{ body: loginUserRequestPayload }> = {
    method: 'post',
    url: '/login',
    middlewares: [validateRequest(loginUserRequestSchema)],
    handler: async function (req, res) {
      const { ...payload } = req.body;
      const ret = await userService.loginUser(payload);
      const code = ret.errors.length ? 400 : 200;

      res.status(code).send(ret);
    },
  };

  const createUser: RouteOptions<{ body: createUserRequestPayload }> = {
    method: 'post',
    url: '/sign-up',
    middlewares: [validateRequest(createUserRequestSchema)],
    handler: async (req, res) => {
      const { ...payload } = req.body;
      console.log({ payload });
      const ret = userService.createUser(payload);
      console.log({ ret });

      res.send(ret);
    },
  };

  const updateUser: RouteOptions<{ body: updateUserRequestPayload }> = {
    method: 'put',
    url: '/',
    middlewares: [validateRequest(updateUserRequestSchema), verifyJWT],
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

  const deleteUser: RouteOptions<{ query: deleteUserRequestPayload }> = {
    method: 'delete',
    url: '/',
    middlewares: [validateRequest(getOrDeleteUserRequestSchema), verifyJWT],
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

  return {
    getUser,
    createUser,
    loginUser,
    updateUser,
    deleteUser,
  };
};
