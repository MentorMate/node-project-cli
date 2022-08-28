// This should be the controller for the samples module with all the routes needed.

import { Sample } from '../../../database/models/sample.model'
import { SamplesService } from './samples.service'

const samplesService = SamplesService({Sample});

export const SamplesController = {
    // ...
}