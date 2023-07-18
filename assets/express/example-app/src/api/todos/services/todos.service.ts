import { Paginated, definedOrNotFound, updatedOrNotFound } from '@utils/query';
import { InsertTodo, ListTodosQuery, Todo, UpdateTodo } from '../entities';
import { TodosRepositoryInterface, TodosServiceInterface } from '../interfaces';

export class TodosService implements TodosServiceInterface {
  constructor(private readonly todos: TodosRepositoryInterface) {}

  create(input: InsertTodo): Promise<Todo> {
    return this.todos.insertOne(input);
  }

  find(id: Todo['id'], userId: Todo['userId']): Promise<Todo> {
    return this.todos
      .findById(id, userId)
      .then(definedOrNotFound('To-Do not found'));
  }

  update(
    id: Todo['id'],
    userId: Todo['userId'],
    input: UpdateTodo
  ): Promise<Todo> {
    return this.todos
      .updateById(id, userId, input)
      .then(definedOrNotFound('To-Do not found'));
  }

  delete(id: Todo['id'], userId: Todo['userId']): Promise<number> {
    return this.todos
      .deleteById(id, userId)
      .then(updatedOrNotFound('To-Do not found'));
  }

  list(
    userId: Todo['userId'],
    query: ListTodosQuery
  ): Promise<Paginated<Todo>> {
    return this.todos.list(userId, query);
  }
}
