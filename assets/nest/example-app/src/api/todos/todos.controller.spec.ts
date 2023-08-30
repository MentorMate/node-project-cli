import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller';
import { todosModuleMetadata } from './todos.module';

describe('TodosController', () => {
  let todosController: TodosController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule(
      todosModuleMetadata,
    ).compile();

    todosController = app.get<TodosController>(TodosController);
  });

  describe('create', () => {
    it('should return "OK"', async () => {
      expect(await todosController.create()).toBe('OK');
    });
  });

  describe('list', () => {
    it('should return "OK"', async () => {
      expect(await todosController.list()).toBe('OK');
    });
  });

  describe('get', () => {
    it('should return "OK"', async () => {
      expect(await todosController.get()).toBe('OK');
    });
  });

  describe('update', () => {
    it('should return "OK"', async () => {
      expect(await todosController.update()).toBe('OK');
    });
  });

  describe('delete', () => {
    it('should return "OK"', async () => {
      expect(await todosController.delete()).toBe('OK');
    });
  });
});
