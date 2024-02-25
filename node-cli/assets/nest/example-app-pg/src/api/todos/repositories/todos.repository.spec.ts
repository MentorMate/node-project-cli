import { Test } from '@nestjs/testing';
import { NestKnexService } from '@database/nest-knex.service';
import { TodosRepository } from './todos.repository';
import {
  createTodoInput,
  findAllTodosInput,
  findOneTodoInput,
  mockedUser,
  todo,
  updateTodoInput,
} from '../__mocks__';

describe('TodosRepository', () => {
  let todosRepository: TodosRepository;

  const first = jest.fn((): Promise<unknown> => Promise.resolve());
  const del = jest.fn(() => Promise.resolve({}));
  const returning = jest.fn().mockImplementation(() => Promise.resolve([]));
  const paginate = jest.fn(() => Promise.resolve({}));

  const sort = jest.fn().mockImplementation(() => ({
    paginate,
  }));

  const filter = jest.fn().mockImplementation(() => ({
    clone,
  }));

  const clone = jest.fn().mockImplementation(() => ({
    sort,
    paginate,
  }));

  const where = jest.fn().mockImplementation(() => ({
    first,
    update,
    del,
    filter,
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
    returning.mockImplementationOnce(() => Promise.resolve([todo]));

    const result = await todosRepository.create(createTodoInput);

    expect(result).toBe(todo);
    expect(insert).toHaveBeenCalledWith({
      id: expect.any(String),
      ...createTodoInput.createTodoDto,
      userId: createTodoInput.userId,
    });
  });

  it('findOne - find a todo', async () => {
    first.mockImplementationOnce(() => Promise.resolve([todo]));

    const result = await todosRepository.findOne(findOneTodoInput);

    expect(result).toStrictEqual([todo]);
    expect(where).toHaveBeenCalledWith(findOneTodoInput);
  });

  it('findOneOrFail - find a todo', async () => {
    first.mockImplementationOnce(() => Promise.resolve([todo]));

    const result = await todosRepository.findOneOrFail(findOneTodoInput);

    expect(result).toStrictEqual([todo]);
    expect(where).toHaveBeenCalledWith(findOneTodoInput);
  });

  describe('update', () => {
    it('update - update a todo', async () => {
      const updatedTodo = {
        ...todo,
        name: updateTodoInput.updateTodoDto.name,
      };

      returning.mockImplementationOnce(() => Promise.resolve([updatedTodo]));

      const result = await todosRepository.update(updateTodoInput);

      expect(result).toStrictEqual(updatedTodo);
      expect(where).toHaveBeenCalledWith({
        id: updateTodoInput.id,
        userId: mockedUser.user.sub,
      });
      expect(update).toHaveBeenCalledWith(updateTodoInput.updateTodoDto);
    });
  });

  it('remove - delete a todo', async () => {
    del.mockImplementationOnce(() => Promise.resolve(1));

    const result = await todosRepository.remove(findOneTodoInput);

    expect(result).toBe(1);
    expect(where).toHaveBeenCalledWith(findOneTodoInput);
  });

  describe('findAll', () => {
    it('find all todos for the user', async () => {
      paginate.mockImplementationOnce(() => Promise.resolve([todo]));
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
