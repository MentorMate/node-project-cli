import { Test, TestingModule } from '@nestjs/testing';
import { HelloWorldController } from './hello-world.controller';

describe('HelloWorldController', () => {
  let helloWorldController: HelloWorldController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HelloWorldController],
    }).compile();

    helloWorldController = app.get<HelloWorldController>(HelloWorldController);
  });

  describe('root', () => {
    it('should return "Hello, World!"', () => {
      expect(helloWorldController.getHello()).toBe('Hello, World!');
    });
  });
});
