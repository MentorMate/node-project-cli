// This should be the controller for the samples module with all the routes needed.

import { SampleService, SampleController } from '../interfaces';

/**
 * Defines the service for the sample-module
 * @param {SamplesService} ServiceInstance - instance of the SampleService for the database
 * @return {Object} - the Service for sample-module with all its possible methods
 */
export function sampleController(ServiceInstance: SampleService): SampleController {
  /**
   * Just a sample method
   * @return {String}
   */
  function sampleAction() {
    return ServiceInstance.sampleMethod();
  }

  // ...

  return {
    sampleAction
  };
}
