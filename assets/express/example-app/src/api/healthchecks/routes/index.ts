import { prefixRoutes } from '@utils/api';
import { livenessRoute } from './live.route';
import { readinessRoute } from './ready.route';

export const healthcheckRoutes = prefixRoutes('/healthz', [
  livenessRoute,
  readinessRoute,
]);
