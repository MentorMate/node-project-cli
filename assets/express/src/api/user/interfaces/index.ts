import { RequestHandler, RouteOptions, RequestSchema } from '@common';
import { createUserRequestSchema, getOrDeleteUserRequestSchema, updateUserRequestSchema } from '../dto/user.dto';
import { UserService } from '@services';

export interface UserRouteOptionsFactory<T extends RequestSchema> {
  (userService: UserService, middlewares: MiddlewareCollection): RouteOptions<T>
}

export interface UserController {
  getUser: RouteOptions<typeof getOrDeleteUserRequestSchema>;
  createUser: RouteOptions<typeof createUserRequestSchema>;
  // loginUser: RouteOptions<{ body: loginUserRequestPayload }>;
  updateUser: RouteOptions<typeof updateUserRequestSchema>;
  deleteUser: RouteOptions<typeof getOrDeleteUserRequestSchema>;
}

export type MiddlewareCollection = {
  verifyJWT: RequestHandler;
};

