import { Test, TestingModule } from '@nestjs/testing';
import { HealthchecksController } from './healthchecks.controller';

describe('HelloWorldController', () => {
  let healthchecksController: HealthchecksController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthchecksController],
    }).compile();

    healthchecksController = app.get<HealthchecksController>(
      HealthchecksController,
    );
  });

  describe('live', () => {
    it('should return "OK"', () => {
      expect(healthchecksController.live()).toBe('OK');
    });
  });

  describe('ready', () => {
    it('should return "OK"', () => {
      expect(healthchecksController.ready()).toBe('OK');
    });
  });
});
