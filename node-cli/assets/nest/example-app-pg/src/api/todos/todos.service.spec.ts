import { DatabaseModule } from '@database/database.module';
import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { TodosRepository } from './repositories';
import {
  createTodoInput,
  mockedUser,
  getPaginatedResponse,
  todo,
  updateTodoDtoInput,
} from './__mocks__';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Errors } from '@utils/enums';
import { dbConfig, nodeConfig } from '@utils/environment';
import { ConfigModule } from '@nestjs/config';

describe('TodosService', () => {
  let service: TodosService;
  let repository: TodosRepository;
  const userId = mockedUser.user.sub;

  beforeAll(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => true as never);
    jest.spyOn(console, 'log').mockImplementation(() => true as never);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        ConfigModule.forRoot({
          load: [nodeConfig, dbConfig],
          isGlobal: true,
          ignoreEnvFile: true,
        }),
      ],
      controllers: [TodosController],
      providers: [TodosService, TodosRepository],
    }).compile();

    service = module.get<TodosService>(TodosService);
    repository = module.get<TodosRepository>(TodosRepository);
  });

  afterAll(() => {
    jest.spyOn(process, 'exit').mockRestore();
    jest.spyOn(console, 'log').mockRestore();
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
        new UnprocessableEntityException(Errors.UnprocessableEntity),
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
        .spyOn(repository, 'findOne')
        .mockImplementationOnce(async () => todo);

      expect(await service.findOne({ id: todo.id, userId })).toStrictEqual(
        todo,
      );
    });
  });

  describe('findOneOrFail', () => {
    it('should return single todo', async () => {
      jest
        .spyOn(repository, 'findOneOrFail')
        .mockImplementationOnce(async () => todo);

      expect(
        await service.findOneOrFail({ id: todo.id, userId }),
      ).toStrictEqual(todo);
    });
  });

  describe('update', () => {
    it('should update single todo', async () => {
      const updatedTodo = { ...todo, ...updateTodoDtoInput };

      jest
        .spyOn(repository, 'update')
        .mockImplementationOnce(async () => updatedTodo);

      expect(
        await service.update({
          id: todo.id,
          userId,
          updateTodoDto: updateTodoDtoInput,
        }),
      ).toStrictEqual(updatedTodo);
    });

    it('should return todo if there is no data to update', async () => {
      jest
        .spyOn(service, 'findOneOrFail')
        .mockImplementationOnce(async () => todo);

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
      jest.spyOn(service, 'findOne').mockImplementationOnce(async () => todo);
      jest.spyOn(repository, 'remove').mockImplementationOnce(async () => 1);

      expect(await service.remove({ id: 1, userId })).toBe(1);
    });

    it('should throw error if todo does not exist', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockImplementationOnce(async () => undefined);

      await expect(service.remove({ id: 1, userId })).rejects.toThrowError(
        new NotFoundException(Errors.NotFound),
      );
    });
  });
});
