import { prefixRoutes } from '@common/api';
import todos from './todos';

export default prefixRoutes('/v1', [...todos]);
