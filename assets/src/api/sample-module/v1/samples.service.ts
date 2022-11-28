// Here there should be the service for the samples module

import { SampleModel } from '@database/interfaces'; // Check the `tsconfig.json` to see the paths that have aliases
import { SampleService } from '../interfaces';

/**
 * Defines the service for the sample-module
 * @param {SampleModel} Sample - the Sample model for the database
 * @return {SampleService} - the Service for sample-module with all its possible methods
 */
export function samplesService(Sample: SampleModel): SampleService {
  /**
   * Just a sample method
   * @param {String} name
   * @return {String}
   */
  function sampleMethod(name: string) {
    return `Hello from ${name}`;
  }

  return {
    sampleMethod
    // ...
  };
}
