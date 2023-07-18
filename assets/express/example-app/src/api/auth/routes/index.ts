import { prefixRoutes } from '@utils/api';
import { loginRoute } from './login.route';
import { registerRoute } from './register.route';

export const authRoutes = prefixRoutes('/auth', [loginRoute, registerRoute]);
