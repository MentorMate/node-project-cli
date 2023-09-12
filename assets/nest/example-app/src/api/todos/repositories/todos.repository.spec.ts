import { Test } from '@nestjs/testing';
import { NestKnexService } from '@database/nest-knex.service';
import { TodosRepository } from './todos.repository';
import {
  CreateTodoInput,
  FindAllTodosInput,
  FindOneTodoInput,
  UpdateTodoInput,
} from '../interfaces/todos.interface';
import { exampleUser, todo } from '../__mocks__/todos.mocks';

describe('TodosRepository', () => {
  let todosRepository: TodosRepository;

  const first = jest.fn(() => Promise.resolve({}));
  const del = jest.fn(() => Promise.resolve({}));

  const returning = jest.fn().mockImplementation(() => Promise.resolve([]));

  const where = jest.fn().mockImplementation(() => ({
    first,
    update,
    del,
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
      userId: +exampleUser.user.sub,
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
      userId: +exampleUser.user.sub,
    };

    first.mockImplementationOnce(() => Promise.resolve([todo]));

    const result = await todosRepository.findOne(todoInput);

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
        userId: +exampleUser.user.sub,
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
        userId: +exampleUser.user.sub,
      });
      expect(update).toHaveBeenCalledWith(todoInput.updateTodoDto);
    });

    it('update - update a todo with empty input', async () => {
      const todoInput: UpdateTodoInput = {
        id: todo.id,
        updateTodoDto: {},
        userId: +exampleUser.user.sub,
      };

      jest
        .spyOn(todosRepository, 'findOne')
        .mockImplementationOnce(async () => todo);

      const result = await todosRepository.update(todoInput);

      expect(result).toStrictEqual(todo);
    });
  });

  it('remove - delete a todo', async () => {
    const todoInput: FindOneTodoInput = {
      id: todo.id,
      userId: +exampleUser.user.sub,
    };

    del.mockImplementationOnce(() => Promise.resolve(1));

    const result = await todosRepository.remove(todoInput);

    expect(result).toBe(1);
    expect(where).toHaveBeenCalledWith(todoInput);
  });

  it('findAll - delete a todo', async () => {
    const todoInput: FindAllTodosInput = {
      query: {},
      userId: +exampleUser.user.sub,
    };

    where.mockImplementationOnce(() => Promise.resolve([todo]));

    const result = await todosRepository.findAll(todoInput);

    expect(result).toStrictEqual({
      data: [todo],
      meta: {
        page: 1,
        items: 20,
        total: 0,
      },
    });
    expect(where).toHaveBeenCalledWith({ userId: todoInput.userId });
  });
});
