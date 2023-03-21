import { prefixRoutes } from '../../../utils';

import login from './login';
import register from './register';

export default prefixRoutes('/auth', [login, register]);
