import { z } from 'zod';
import { RequestHandler, RouteOptions, RequestSchema } from '@common';
import {
  createUserRequestPayload,
  createOrUpdateUserResponsePayload,
  loginUserRequestPayload,
  loginUserResponsePayload,
  updateUserRequestPayload,
  deleteUserRequestPayload,
  deleteUserResponsePayload,
  getUserRequestPayload,
  getUserResponsePayload,
} from '../dto/user.dto';

export type createUserRequestPayload = z.infer<typeof createUserRequestPayload>;
export type createOrUpdateUserResponsePayload = z.infer<
  typeof createOrUpdateUserResponsePayload
>;

export type getUserRequestPayload = z.infer<typeof getUserRequestPayload>;
export type getUserResponsePayload = z.infer<typeof getUserResponsePayload>;

export type loginUserRequestPayload = z.infer<typeof loginUserRequestPayload>;
export type loginUserResponsePayload = z.infer<typeof loginUserResponsePayload>;

export type updateUserRequestPayload = z.infer<typeof updateUserRequestPayload>;

export type deleteUserRequestPayload = z.infer<typeof deleteUserRequestPayload>;
export type deleteUserResponsePayload = z.infer<
  typeof deleteUserResponsePayload
>;

export interface UserService {
  loginUser: (
    payload: loginUserRequestPayload
  ) => Promise<loginUserResponsePayload>;
  createUser: (
    payload: createUserRequestPayload
  ) => Promise<createOrUpdateUserResponsePayload>;
  getAllUsers: () => Promise<getUserResponsePayload>;
  getUser: (payload: getUserRequestPayload) => Promise<getUserResponsePayload>;
  updateUser: (
    payload: updateUserRequestPayload
  ) => Promise<createOrUpdateUserResponsePayload>;
  deleteUser: (
    payload: deleteUserRequestPayload
  ) => Promise<deleteUserResponsePayload>;
}

export interface UserController {
  getUser: RouteOptions<{ query: getUserRequestPayload }>;
  createUser: RouteOptions<{ body: createUserRequestPayload }>;
  loginUser: RouteOptions<{ body: loginUserRequestPayload }>;
  updateUser: RouteOptions<{ body: updateUserRequestPayload }>;
  deleteUser: RouteOptions<{ query: deleteUserRequestPayload }>;
}

export type MiddlewareCollection = {
  verifyJWT: RequestHandler;
  validateRequest: (schema: RequestSchema) => RequestHandler;
};

export interface ApiRoutesDefinition extends Record<string, object> {
  users: UserController;
  // todos: TodosController
}
