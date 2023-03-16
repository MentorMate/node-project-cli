import { attachPrefix } from '@common';
import { AuthService } from '@modules';

import loginRouteOptions from './login';

export default function ({ authService }: { authService: AuthService }) {
  const routes = [loginRouteOptions({ authService })];

  return attachPrefix(routes, '/auth');
}
