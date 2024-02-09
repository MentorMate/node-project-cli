import { prefixRoutes } from '@utils/api';
import { registerRoute } from './register.route';

export const authRoutes = prefixRoutes('/auth', [registerRoute]);
