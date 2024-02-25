import { RecordNotFoundError } from '@database/errors';
import { Todo } from '../entities';
import { TodosRepository } from '../repositories';
import { TodosService } from './todos.service';

jest.mock('../repositories/todos.repository');

describe('TodoService', () => {
  const todos = new TodosRepository({} as never);
  const todosService = new TodosService(todos);
  const userId = '1';

  describe('create', () => {
    it('should create the record', async () => {
      const todo = await todosService.create({
        userId,
        name: 'Todo',
        completed: false,
      });
      expect(await todosService.find(todo.id, userId)).toBeDefined();
    });
  });

  describe('find', () => {
    describe('when the record does not exist', () => {
      it('should throw an error', async () => {
        await expect(
          todosService.find(Date.now().toString(), userId)
        ).rejects.toThrow(RecordNotFoundError);
      });
    });

    describe('when the record exists', () => {
      let todo: Todo;

      beforeAll(async () => {
        todo = await todosService.create({
          userId,
          name: 'Todo',
          completed: false,
        });
      });

      it('should return the record', async () => {
        expect(await todosService.find(todo.id, userId)).toBeDefined();
      });
    });
  });

  describe('update', () => {
    describe('when the record does not exist', () => {
      it('should throw an error', async () => {
        await expect(
          todosService.update(Date.now().toString(), userId, { completed: true })
        ).rejects.toThrow(RecordNotFoundError);
      });
    });

    describe('when the record exists', () => {
      let todo: Todo;

      beforeAll(async () => {
        todo = await todosService.create({
          userId,
          name: 'Todo',
          completed: false,
        });
      });

      it('should update the record', async () => {
        const input = { name: 'new-name', note: 'new note', completed: true };
        const updated = await todosService.update(todo.id, userId, input);
        expect(updated).toEqual(expect.objectContaining(input));
      });
    });
  });

  describe('delete', () => {
    describe('when the record does not exist', () => {
      it('should throw an error', async () => {
        await expect(
          todosService.delete(Date.now().toString(), userId)
        ).rejects.toThrow(RecordNotFoundError);
      });
    });

    describe('when the record exists', () => {
      let todo: Todo;

      beforeAll(async () => {
        todo = await todosService.create({
          userId,
          name: 'Todo',
          completed: false,
        });
      });

      it('should delete the record', async () => {
        await todosService.delete(todo.id, userId);
        await expect(todosService.find(todo.id, userId)).rejects.toThrow(
          RecordNotFoundError
        );
      });
    });
  });

  describe('list', () => {
    const userId = '2';

    beforeAll(async () => {
      await todosService.create({ userId, name: 'Abc 1', completed: false });
      await todosService.create({ userId, name: 'Abc 2', completed: true });
      await todosService.create({ userId, name: 'Zyx 1', completed: false });
      await todosService.create({ userId, name: 'Zyx 2', completed: true });
      await todosService.create({ userId, name: 'Zyx 3', completed: false });
    });

    it('should list my toods', async () => {
      const result = await todosService.list(userId, {});
      expect(result.data).toHaveLength(5);
      expect(result.meta.total).toBe(5);
    });
  });
});
