// Here there should be the service for the samples module

import { SampleModel } from '@database/interfaces'; // Check the `tsconfig.json` to see the paths that have aliases
import { SampleService } from '../interfaces';

export function SamplesService({ Sample }: { Sample: SampleModel }): SampleService {
  function sampleAction() {
    console.log('Hello from Sample Service');
  }

  return {
    sampleAction
  }
  // ...
};
