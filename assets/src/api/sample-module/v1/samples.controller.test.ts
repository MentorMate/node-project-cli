// Tests for samples.controller

import { SampleService, SampleController } from '../interfaces';
import { sampleController } from './samples.controller';
let mockSampleService: SampleService;
let controller: SampleController;

beforeEach(function () {
  mockSampleService = {
    sampleMethod: jest.fn()
  };
  controller = sampleController(mockSampleService);
});

it('calls the sample method', function () {
  controller.sampleAction();

  expect(mockSampleService.sampleMethod).toBeCalled;
});
