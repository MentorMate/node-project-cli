import { Test } from '@nestjs/testing';
import { NestKnexService } from '@database/nest-knex.service';
import { TodosRepository } from './todos.repository';
import {
  CreateTodoInput,
  FindAllTodosInput,
  FindOneTodoInput,
  UpdateTodoInput,
} from '../interfaces/todos.interface';
import { mockedUser, todo } from '../__mocks__/todos.mocks';

describe('TodosRepository', () => {
  let todosRepository: TodosRepository;

  const first = jest.fn(() => Promise.resolve({}));
  const del = jest.fn(() => Promise.resolve({}));
  const returning = jest.fn().mockImplementation(() => Promise.resolve([]));
  const paginate = jest.fn(() => Promise.resolve({}));
  const count = jest.fn(() => Promise.resolve({}));

  const sort = jest.fn().mockImplementation(() => ({
    paginate,
  }));

  const filter = jest.fn().mockImplementation(() => ({
    sort,
    count,
  }));

  const clone = jest.fn().mockImplementation(() => ({
    filter,
  }));

  const where = jest.fn().mockImplementation(() => ({
    first,
    update,
    del,
    clone,
  }));

  const insert = jest.fn().mockImplementation(() => ({
    returning,
  }));

  const update = jest.fn().mockImplementation(() => ({
    returning,
  }));

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: NestKnexService,
          useFactory: () => ({
            connection: () => ({
              insert,
              where,
            }),
          }),
        },
        TodosRepository,
      ],
    }).compile();

    todosRepository = moduleRef.get<TodosRepository>(TodosRepository);
  });

  it('create - create a todo', async () => {
    const todoInput: CreateTodoInput = {
      createTodoDto: {
        name: todo.name,
        note: todo.note,
        completed: todo.completed,
      },
      userId: mockedUser.user.sub,
    };

    returning.mockImplementationOnce(() => Promise.resolve([todo]));

    const result = await todosRepository.create(todoInput);

    expect(result).toBe(todo);
    expect(insert).toHaveBeenCalledWith({
      ...todoInput.createTodoDto,
      userId: todoInput.userId,
    });
  });

  it('findOne - find a todo', async () => {
    const todoInput: FindOneTodoInput = {
      id: todo.id,
      userId: mockedUser.user.sub,
    };

    first.mockImplementationOnce(() => Promise.resolve([todo]));

    const result = await todosRepository.findOne(todoInput);

    expect(result).toStrictEqual([todo]);
    expect(where).toHaveBeenCalledWith(todoInput);
  });

  it('findOneOrFail - find a todo', async () => {
    const todoInput: FindOneTodoInput = {
      id: todo.id,
      userId: mockedUser.user.sub,
    };

    first.mockImplementationOnce(() => Promise.resolve([todo]));

    const result = await todosRepository.findOneOrFail(todoInput);

    expect(result).toStrictEqual([todo]);
    expect(where).toHaveBeenCalledWith(todoInput);
  });

  describe('update', () => {
    it('update - update a todo', async () => {
      const todoInput: UpdateTodoInput = {
        id: todo.id,
        updateTodoDto: {
          name: 'New ToDo Name',
        },
        userId: mockedUser.user.sub,
      };

      const updatedTodo = {
        ...todo,
        name: todoInput.updateTodoDto.name,
      };

      returning.mockImplementationOnce(() => Promise.resolve([updatedTodo]));

      const result = await todosRepository.update(todoInput);

      expect(result).toStrictEqual(updatedTodo);
      expect(where).toHaveBeenCalledWith({
        id: todoInput.id,
        userId: mockedUser.user.sub,
      });
      expect(update).toHaveBeenCalledWith(todoInput.updateTodoDto);
    });
  });

  it('remove - delete a todo', async () => {
    const todoInput: FindOneTodoInput = {
      id: todo.id,
      userId: mockedUser.user.sub,
    };

    del.mockImplementationOnce(() => Promise.resolve(1));

    const result = await todosRepository.remove(todoInput);

    expect(result).toBe(1);
    expect(where).toHaveBeenCalledWith(todoInput);
  });

  it('findAll - find all todos for the user', async () => {
    const todoInput: FindAllTodosInput = {
      query: {},
      userId: mockedUser.user.sub,
    };

    paginate.mockImplementationOnce(() => Promise.resolve([todo]));
    count.mockImplementationOnce(() => Promise.resolve([{ count: 1 }]));

    const result = await todosRepository.findAll(todoInput);

    expect(result).toStrictEqual({
      data: [todo],
      meta: {
        page: 1,
        items: 20,
        total: 1,
      },
    });
  });
});
