// This should be the controller for the samples module with all the routes needed.

import { Sample } from '@database/models'; // Check the `tsconfig.json` to see the paths that have aliases
import { SamplesService } from './samples.service';

const samplesService = SamplesService({Sample});

export const SamplesController = {
  sampleAction() {
    samplesService.sampleAction();
  }
  // ...
};
