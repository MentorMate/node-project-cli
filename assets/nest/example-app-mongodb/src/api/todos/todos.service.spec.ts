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
import { ObjectId } from 'mongodb';
import { DatabaseService } from '@database/database.service';
import { NEST_MONGO_OPTIONS } from '@database/constants';

describe('TodosService', () => {
  let service: TodosService;
  let repository: TodosRepository;
  const userId = mockedUser.user.sub;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [TodosController],
      providers: [
        TodosService,
        TodosRepository,
        {
          provide: NEST_MONGO_OPTIONS,
          useValue: {
            urlString: 'mongodb://mock-host',
            databaseName: 'test',
            clientOptions: {},
            migrationsDir: '../../migrations',
            seedsDir: './seeds/test',
          },
        },
        DatabaseService,
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    repository = module.get<TodosRepository>(TodosRepository);
  });

  describe('create', () => {
    it('should return created todo', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockImplementationOnce(async () => null);
      jest
        .spyOn(repository, 'create')
        .mockImplementationOnce(async () => todo._id);

      expect(await service.create(createTodoInput)).toStrictEqual(todo._id);
    });

    it('should throw error if todo with the same name exists', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockImplementationOnce(async () => todo);

      await expect(service.create(createTodoInput)).rejects.toThrowError(
        new UnprocessableEntityException(Errors.UnprocessableEntity)
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
        paginatedResponse
      );
    });
  });

  describe('findOne', () => {
    it('should return single todo', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockImplementationOnce(async () => todo);

      expect(await service.findOne({ _id: todo._id, userId })).toStrictEqual(
        todo
      );
    });
  });

  describe('findOneOrFail', () => {
    it('should return single todo', async () => {
      jest
        .spyOn(repository, 'findOneOrFail')
        .mockImplementationOnce(async () => todo);

      expect(
        await service.findOneOrFail({ _id: todo._id, userId })
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
          _id: todo._id,
          userId,
          updateTodoDto: updateTodoDtoInput,
        })
      ).toStrictEqual(updatedTodo);
    });

    it('should return todo if there is no data to update', async () => {
      jest
        .spyOn(service, 'findOneOrFail')
        .mockImplementationOnce(async () => todo);

      expect(
        await service.update({
          _id: todo._id,
          userId,
          updateTodoDto: {},
        })
      ).toStrictEqual(todo);
    });
  });

  describe('remove', () => {
    it('should delete single todo', async () => {
      jest.spyOn(service, 'findOne').mockImplementationOnce(async () => todo);
      jest.spyOn(repository, 'remove').mockImplementationOnce(async () => todo);

      expect(await service.remove({ _id: new ObjectId(1), userId })).toBe(true);
    });

    it('should throw error if todo does not exist', async () => {
      jest.spyOn(repository, 'remove').mockImplementationOnce(async () => null);

      await expect(
        service.remove({ _id: new ObjectId(1), userId })
      ).rejects.toThrowError(new NotFoundException(Errors.NotFound));
    });
  });
});
