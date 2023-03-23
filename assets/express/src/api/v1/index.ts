import todos from './todos';
import auth from './auth';
import { prefixRoutes } from '../utils';

export default prefixRoutes('/v1', [...todos, ...auth]);
