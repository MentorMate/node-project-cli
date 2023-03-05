import { HealthzController } from './interfaces';
import { healthzControllerFactory } from './v1';

export * from './interfaces'

export function healthzModuleFactory(): HealthzController {
  return healthzControllerFactory();
}
