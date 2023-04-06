import { prefixRoutes } from '../utils';
import live from './live';
import ready from './ready';

export default prefixRoutes('/healthz', [live, ready]);
