import Knex from 'knex';
import { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';
import { RecordNotFoundError } from '@database/errors';
import { Todo } from '../entities';
import { TodosRepository } from './todos.repository';
import { filterByCompleted, filterByName } from '../filters';
import { sortByCreatedAt, sortByName } from '../sorters';

describe('TodosRepository', () => {
  const knex = Knex({ client: 'pg', connection: {} });
  const todos = new TodosRepository(knex);
  const todosQb = knex('todos');

  describe('insertOne', () => {
    it('should return the newly created record', async () => {
      const todo = {
        userId: '1',
        name: 'Laundry',
        note: 'Now!',
        completed: false,
      };

      jest.spyOn(todosQb, 'insert');
      jest.spyOn(todosQb, 'returning');
      jest.spyOn(todosQb, 'then');
      jest.spyOn(todosQb, 'catch').mockImplementationOnce(async () => ({
        id: 1,
        ...todo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const result = await todos.insertOne(todo);

      expect(todosQb.insert).toHaveBeenCalledWith({
        id: expect.any(String),
        ...todo,
      });
      expect(todosQb.returning).toHaveBeenCalledWith('*');
      expect(todosQb.then).toHaveBeenCalled();
      expect(todosQb.catch).toHaveBeenCalled();

      expect(result).toEqual(expect.objectContaining(todo));
    });
  });

  describe('findById', () => {
    it('should retrun the first record found', async () => {
      const todo: Todo = {
        id: '1',
        userId: '1',
        name: 'Laundry',
        note: 'Now!',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      jest.spyOn(todosQb, 'where');
      jest
        .spyOn(todosQb, 'first')
        .mockImplementationOnce(() => Promise.resolve(todo) as never);

      const result = await todos.findById(todo.id, todo.userId);

      expect(todosQb.where).toHaveBeenCalledWith({
        id: todo.id,
        userId: todo.userId,
      });
      expect(todosQb.first).toHaveBeenCalled();

      expect(result).toEqual(todo);
    });
  });

  describe('updateById', () => {
    it('should perform a findById with empty payload', async () => {
      const todo: Todo = {
        id: '1',
        userId: '1',
        name: 'Laundry',
        note: 'Now!',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      jest.spyOn(todos, 'findById').mockImplementationOnce(async () => todo);
      jest.spyOn(todosQb, 'update');

      await todos.updateById(todo.id, todo.userId, {});

      expect(todos.findById).toHaveBeenCalledWith(todo.id, todo.userId);
      expect(todosQb.update).not.toHaveBeenCalled();
    });

    it('should update the record and return it', async () => {
      const todo: Todo = {
        id: '1',
        userId: '1',
        name: 'Laundry',
        note: 'Now!',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const input = { note: 'updated' };
      const updated = { ...todo, ...input };

      jest.spyOn(todosQb, 'where');
      jest.spyOn(todosQb, 'update');
      jest.spyOn(todosQb, 'returning');
      jest.spyOn(todosQb, 'then');
      jest
        .spyOn(todosQb, 'catch')
        .mockImplementationOnce(() => Promise.resolve(updated) as never);

      const result = await todos.updateById(todo.id, todo.userId, input);

      expect(todosQb.where).toHaveBeenCalledWith({
        id: todo.id,
        userId: todo.userId,
      });
      expect(todosQb.update).toHaveBeenCalledWith(input);
      expect(todosQb.returning).toHaveBeenCalledWith('*');
      expect(todosQb.then).toHaveBeenCalled();
      expect(todosQb.catch).toHaveBeenCalled();

      expect(result).toEqual(updated);
    });

    it('should rethrow fk violation on userId as RecordNotFound', () => {
      const error = new DatabaseError('fk violation', 72, 'error');
      error.code = PostgresError.FOREIGN_KEY_VIOLATION;
      error.constraint = 'fk_todos_user_id';
      const thenable = () => ({ then: () => Promise.reject(error) });

      jest
        .spyOn(todosQb, 'returning')
        .mockImplementationOnce(thenable as never);

      expect(
        todos.insertOne({
          userId: '1',
          name: 'name',
          note: 'note',
          completed: false,
        })
      ).rejects.toThrow(new RecordNotFoundError('User not found'));
    });
  });

  describe('deleteById', () => {
    it('should delete the record by ID', async () => {
      jest.spyOn(todosQb, 'where');
      jest
        .spyOn(todosQb, 'del')
        .mockImplementationOnce(() => Promise.resolve(1) as never);

      const result = await todos.deleteById('1', '1');

      expect(todosQb.where).toHaveBeenCalledWith({ id: '1', userId: '1' });
      expect(todosQb.del).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('list', () => {
    it('should list the records', async () => {
      jest.spyOn(todosQb, 'where');
      jest.spyOn(todosQb, 'clone');
      jest.spyOn(todosQb, 'filter');
      jest.spyOn(todosQb, 'sort');
      jest
        .spyOn(todosQb, 'paginate')
        .mockImplementationOnce(() => Promise.resolve([]) as never);
      jest
        .spyOn(todosQb, 'count')
        .mockImplementationOnce(() => Promise.resolve([{ count: 0 }]) as never);

      const userId = '1';
      const query = {};

      await todos.list(userId, query);

      expect(todosQb.where).toHaveBeenCalledWith({ userId });
      expect(todosQb.clone).toHaveBeenCalledTimes(2);
      expect(todosQb.filter).toHaveBeenCalledWith(undefined, {
        name: filterByName,
        completed: filterByCompleted,
      });
      expect(todosQb.sort).toHaveBeenCalledWith(undefined, {
        name: sortByName,
        createdAt: sortByCreatedAt,
      });
      expect(todosQb.count).toHaveBeenCalled();
    });
  });
});
