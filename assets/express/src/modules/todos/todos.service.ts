import { definedOrNotFound, updatedOrNotFound } from '@common';
import { ListTodosQuery, TodoRepository, handleDbError } from '@database';
import { TodoService } from './interfaces';
import { CreateTodoInput, Todo, UpdateTodoInput } from '..';

export function initializeTodoService({
  todoRepository,
}: {
  todoRepository: TodoRepository;
}): TodoService {
  return {
    find: async function (id: number) {
      let todo;

      try {
        todo = await todoRepository.find(id);
      } catch (err) {
        handleDbError(err);
      }

      return definedOrNotFound<Todo>('To-Do not found')(todo);
    },
    list: async function (query: ListTodosQuery) {
      let todos;

      try {
        todos = await todoRepository.list(query);
      } catch (err) {
        handleDbError(err);
      }

      return todos;
    },
    create: async function (payload: CreateTodoInput) {
      let todo;

      try {
        todo = await todoRepository.create(payload);
      } catch (err) {
        handleDbError(err);
      }

      return todo;
    },
    update: async function (id: number, payload: UpdateTodoInput) {
      let updatedTodo;

      try {
        updatedTodo = await todoRepository.update(id, payload);
      } catch (err) {
        handleDbError(err);
      }

      return definedOrNotFound<Todo>('To-Do not found')(updatedTodo);
    },
    delete: async function (id: number) {
      let deletedEntries = 0;

      try {
        deletedEntries = await todoRepository.delete(id);
      } catch (err) {
        handleDbError(err);
      }

      return updatedOrNotFound('To-Do not found')(deletedEntries);
    },
  };
}
