import { ControllerFactory } from "@common";
import { UserService } from "@services";
import { MiddlewareCollection, UserController } from "../interfaces";

import { getUserRouteOptions } from "./get-user";
import { createUserRouteOptions } from './create-user'
import { updateUserRouteOptions } from "./update-user";
import { deleteUserRouteOptions } from "./delete-user";

import { verifyJWT } from "@middleware";

export const userControllerFactory: ControllerFactory<
  UserService,
  UserController
> = function userController(userService) {
  const routeArgs: [UserService, MiddlewareCollection] = [userService, { verifyJWT }]
  
  return {
    getUser: getUserRouteOptions(...routeArgs),
    createUser: createUserRouteOptions(...routeArgs),
    updateUser: updateUserRouteOptions(...routeArgs),
    deleteUser: deleteUserRouteOptions(...routeArgs)
  }
}
