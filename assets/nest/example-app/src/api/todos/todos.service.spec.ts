import { DatabaseModule } from '@database/database.module';
import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { TodosRepository } from './repositories/todos.repository';
import {
  createTodoInput,
  mockedUser,
  getPaginatedResponse,
  todo,
  updateTodoInput,
} from './__mocks__/todos.mocks';
import { UnprocessableEntityException } from '@nestjs/common';

describe('TodosService', () => {
  let service: TodosService;
  let repository: TodosRepository;
  const userId = mockedUser.user.sub;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [TodosController],
      providers: [TodosService, TodosRepository],
    }).compile();

    service = module.get<TodosService>(TodosService);
    repository = module.get<TodosRepository>(TodosRepository);
  });

  describe('create', () => {
    it('should return created todo', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockImplementationOnce(async () => undefined);
      jest.spyOn(repository, 'create').mockImplementationOnce(async () => todo);

      expect(await service.create(createTodoInput)).toStrictEqual(todo);
    });

    it('should throw error if todo with the same name exists', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockImplementationOnce(async () => todo);

      await expect(service.create(createTodoInput)).rejects.toThrowError(
        new UnprocessableEntityException('Already exists'),
      );
    });
  });

  describe('findAll', () => {
    it('should return todos', async () => {
      const paginatedResponse = getPaginatedResponse([todo]);

      jest
        .spyOn(repository, 'findAll')
        .mockImplementationOnce(async () => paginatedResponse);

      expect(await service.findAll({ userId, query: {} })).toStrictEqual(
        paginatedResponse,
      );
    });
  });

  describe('findOne', () => {
    it('should return single todo', async () => {
      jest
        .spyOn(repository, 'findOneOrFail')
        .mockImplementationOnce(async () => todo);

      expect(await service.findOne({ id: todo.id, userId })).toStrictEqual(
        todo,
      );
    });
  });

  describe('update', () => {
    it('should update single todo', async () => {
      const updatedTodo = { ...todo, ...updateTodoInput };

      jest
        .spyOn(repository, 'update')
        .mockImplementationOnce(async () => updatedTodo);

      expect(
        await service.update({
          id: todo.id,
          userId,
          updateTodoDto: updateTodoInput,
        }),
      ).toStrictEqual(updatedTodo);
    });

    it('should return todo if there is no data to update', async () => {
      jest.spyOn(service, 'findOne').mockImplementationOnce(async () => todo);

      expect(
        await service.update({
          id: todo.id,
          userId,
          updateTodoDto: {},
        }),
      ).toStrictEqual(todo);
    });
  });

  describe('remove', () => {
    it('should delete single todo', async () => {
      jest.spyOn(repository, 'remove').mockImplementationOnce(async () => 1);

      expect(await service.remove({ id: 1, userId })).toBe(1);
    });
  });
});
