import { definedOrNotFound, updatedOrNotFound } from '@common';
import { TodosRepositoryInterface } from '@modules/database';
import { TodoService } from './interfaces';

export const createTodoService = (
  todos: TodosRepositoryInterface
): TodoService => ({
  find(id) {
    return todos.findById(id).then(definedOrNotFound('To-Do not found'));
  },
  list(query) {
    return todos.list(query);
  },
  create(payload) {
    return todos.insertOne(payload);
  },
  update(id, payload) {
    return todos
      .updateById(id, payload)
      .then(definedOrNotFound('To-Do not found'));
  },
  delete(id) {
    return todos.deleteById(id).then(updatedOrNotFound('To-Do not found'));
  },
});
