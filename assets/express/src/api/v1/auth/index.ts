import { prefixRoutes } from '../../utils';

import login from './routes/login';
import register from './routes/register';

export default prefixRoutes('/auth', [login, register]);
