import { AuthService } from '@modules';
import { prefixRoutes } from '@api/utils';

import loginRouteOptions from './login';
import registerRouteOptions from './register';

export default function ({ authService }: { authService: AuthService }) {
  const routes = [
    loginRouteOptions({ authService }),
    registerRouteOptions({ authService }),
  ];

  return prefixRoutes('/auth', routes);
}
