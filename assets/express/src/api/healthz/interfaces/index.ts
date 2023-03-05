import { RouteOptions } from '@common';

export interface HealthzController {
  live: RouteOptions;
  ready: RouteOptions;
}

