import { prefixRoutes } from '@common/api';
import routes from './routes';

export default prefixRoutes('/todos', routes);
