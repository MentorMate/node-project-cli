import { DbCollection } from '@database';

export interface ControllerFactory<ServiceType, ControllerType> {
  (service: ServiceType): ControllerType;
}

export interface ModuleFactory<ControllerType> {
  (dbCollection: DbCollection): ControllerType;
}

