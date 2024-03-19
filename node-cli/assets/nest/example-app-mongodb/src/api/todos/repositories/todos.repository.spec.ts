import { Test } from '@nestjs/testing';
import { TodosRepository } from './todos.repository';
import {
  createTodoInput,
  findAllTodosInput,
  findOneTodoInput,
  mockedUser,
  secondTodo,
  todo,
  updateTodoInput,
} from '../__mocks__';
import { DatabaseService } from '@database/database.service';
import { ObjectId } from 'mongodb';
import { SortOrder } from '@utils/query';

describe('TodosRepository', () => {
  let todosRepository: TodosRepository;

  const mockFn = jest.fn().mockImplementation(() => Promise.resolve([]));

  const toArray = jest.fn().mockImplementation(() => Promise.resolve([]));
  const sort = jest.fn().mockImplementation(() => ({
    skip: () => ({ limit: () => ({ toArray }) }),
  }));
  const find = jest.fn().mockImplementation(() => ({
    sort,
  }));

  const insertOne = jest.fn().mockImplementation(async () => mockFn());
  const findOne = jest.fn().mockImplementation(() => mockFn());
  const findOneAndUpdate = jest.fn().mockImplementation(() => mockFn());
  const findOneAndDelete = jest.fn().mockImplementation(() => mockFn());

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: DatabaseService,
          useFactory: () => ({
            connection: {
              collection: () => ({
                insertOne,
                find,
                findOne,
                findOneAndUpdate,
                findOneAndDelete,
              }),
            },
          }),
        },
        TodosRepository,
      ],
    }).compile();

    todosRepository = moduleRef.get<TodosRepository>(TodosRepository);
  });

  it('create - create a todo', async () => {
    mockFn.mockImplementationOnce(() =>
      Promise.resolve({ insertedId: todo._id }),
    );

    const result = await todosRepository.create(createTodoInput);

    expect(result).toBe(todo._id);
    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        ...createTodoInput.createTodoDto,
        userId: createTodoInput.userId,
      }),
    );
  });

  it('findOne - find a todo', async () => {
    mockFn.mockImplementationOnce(() => Promise.resolve([todo]));

    const result = await todosRepository.findOne(findOneTodoInput);

    expect(result).toStrictEqual([todo]);
    expect(findOne).toHaveBeenCalledWith(findOneTodoInput);
  });

  it('findOneOrFail - find a todo', async () => {
    mockFn.mockImplementationOnce(() => Promise.resolve([todo]));

    const result = await todosRepository.findOneOrFail(findOneTodoInput);

    expect(result).toStrictEqual([todo]);
    expect(findOne).toHaveBeenCalledWith(findOneTodoInput);
  });

  describe('update', () => {
    it('update - update a todo', async () => {
      const updatedTodo = {
        ...todo,
        name: updateTodoInput.updateTodoDto.name,
      };

      mockFn.mockImplementationOnce(() => Promise.resolve(updatedTodo));

      const result = await todosRepository.update(updateTodoInput);

      expect(result).toStrictEqual(updatedTodo);
      expect(findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: updateTodoInput._id,
          userId: new ObjectId(mockedUser.user.sub),
        },
        {
          $set: {
            completed: updateTodoInput.updateTodoDto.completed,
            name: updateTodoInput.updateTodoDto.name,
            note: updateTodoInput.updateTodoDto.note,
          },
        },
        { returnDocument: 'after' },
      );
    });
  });

  it('remove - delete a todo', async () => {
    mockFn.mockImplementationOnce(() => Promise.resolve(todo));

    const result = await todosRepository.remove(findOneTodoInput);

    expect(result).toBe(todo);
    expect(findOneAndDelete).toHaveBeenCalledWith(findOneTodoInput);
  });

  describe('findAll', () => {
    it('find all todos for the user sorted by `createdAt` in ascending order', async () => {
      toArray.mockImplementationOnce(() => Promise.resolve([todo, secondTodo]));
      jest.spyOn(todosRepository, 'count').mockResolvedValueOnce(2);

      const result = await todosRepository.findAll(findAllTodosInput);

      expect(sort).toHaveBeenCalledWith('createdAt', 1);
      expect(result).toStrictEqual({
        items: [todo, secondTodo],
        total: 2,
        currentPage: 1,
        totalPages: 1,
      });
    });

    it('find all todos for the user sorted by `createdAt` in descending order', async () => {
      toArray.mockImplementationOnce(() => Promise.resolve([secondTodo, todo]));
      jest.spyOn(todosRepository, 'count').mockResolvedValueOnce(2);
      const { userId, query } = findAllTodosInput;

      const result = await todosRepository.findAll({
        userId,
        query: {
          ...query,
          order: SortOrder.Desc,
        },
      });

      expect(sort).toHaveBeenCalledWith('createdAt', -1);
      expect(result).toStrictEqual({
        items: [secondTodo, todo],
        total: 2,
        currentPage: 1,
        totalPages: 1,
      });
    });
  });
});
