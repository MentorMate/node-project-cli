import { Test } from '@nestjs/testing';
import { TodosRepository } from './todos.repository';
import {
  createTodoInput,
  findAllTodosInput,
  findOneTodoInput,
  mockedUser,
  todo,
  updateTodoInput,
} from '../__mocks__';
import { DatabaseService } from '@database/database.service';
import { ObjectId } from 'mongodb';

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
      Promise.resolve({ insertedId: todo._id })
    );

    const result = await todosRepository.create(createTodoInput);

    expect(result).toBe(todo._id);
    expect(insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        ...createTodoInput.createTodoDto,
        userId: createTodoInput.userId,
      })
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
        { returnDocument: 'after' }
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
    it('find all todos for the user', async () => {
      toArray.mockImplementationOnce(() => Promise.resolve([todo]));
      jest.spyOn(todosRepository, 'count').mockResolvedValueOnce(1);

      const result = await todosRepository.findAll(findAllTodosInput);

      expect(result).toStrictEqual({
        items: [todo],
        total: 1,
        currentPage: 1,
        totalPages: 1,
      });
    });
  });
});
