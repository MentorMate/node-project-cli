// Tests for samples.service

import { SampleModel } from '@database/interfaces'; // Check the `tsconfig.json` to see the paths that have aliases
import { samplesService } from './samples.service';
import { sampleService as inputData } from '../__data__/input.json';
import { sampleService as outputData } from '../__data__/output.json';

const service = samplesService({ Sample: {} as SampleModel });

it('returns the pre-defined string', function () {
  const result = service.sampleMethod(inputData.sampleMethod);
  expect(result).toBe(outputData.sampleMethod);
});
