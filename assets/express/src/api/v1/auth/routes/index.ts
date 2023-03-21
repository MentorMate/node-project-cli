import { attachPrefix } from '@common';
import { AuthService } from '@modules';

import loginRouteOptions from './login';
import registerRouteOptions from './register';

export default function ({ authService }: { authService: AuthService }) {
  const routes = [
    loginRouteOptions({ authService }),
    registerRouteOptions({ authService }),
  ];

  return attachPrefix(routes, '/auth');
}
