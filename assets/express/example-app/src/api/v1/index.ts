import todos from './todos';
import { prefixRoutes } from '../utils';

export default prefixRoutes('/v1', [...todos]);
