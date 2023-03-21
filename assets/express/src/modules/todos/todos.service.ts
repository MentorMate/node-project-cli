import { definedOrNotFound, updatedOrNotFound } from '@common';
import { TodoRepository } from '@database';
import { TodoService } from './interfaces';

export const createTodoService = (todos: TodoRepository): TodoService => ({
  find(id) {
    return todos.find(id).then(definedOrNotFound('To-Do not found'));
  },
  list(query) {
    return todos.list(query);
  },
  create(payload) {
    return todos.create(payload);
  },
  update(id, payload) {
    return todos.update(id, payload).then(definedOrNotFound('To-Do not found'));
  },
  delete(id) {
    return todos.delete(id).then(updatedOrNotFound('To-Do not found'));
  },
});
