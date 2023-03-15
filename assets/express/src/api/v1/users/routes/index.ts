import { attachPrefix } from '@common';
import { UserService } from '@modules';

import getUserRouteOptions from './get-user';
import listUsersRouteOptions from './list-users';
import createUserRouteOptions from './create-user';
import updateUserRouteOptions from './update-user';
import patchUserRouteOptions from './patch-user';
import deleteUserRouteOptions from './delete-user';

export default function ({ userService }: { userService: UserService }) {
  const routes = [
    getUserRouteOptions({ userService }),
    listUsersRouteOptions({ userService }),
    createUserRouteOptions({ userService }),
    updateUserRouteOptions({ userService }),
    patchUserRouteOptions({ userService }),
    deleteUserRouteOptions({ userService }),
  ];

  return attachPrefix(routes, '/users');
}
