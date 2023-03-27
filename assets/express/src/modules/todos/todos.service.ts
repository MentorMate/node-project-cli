import { definedOrNotFound, updatedOrNotFound } from '@common/error';
import { Paginated } from '@common/query';
import {
  InsertTodo,
  ListTodosQuery,
  Todo,
  TodosRepositoryInterface,
  UpdateTodo,
} from '@modules/database';
import { TodosServiceInterface } from './todos.service.interface';

export class TodosService implements TodosServiceInterface {
  constructor(private readonly todos: TodosRepositoryInterface) {}

  create(input: InsertTodo): Promise<Todo> {
    return this.todos.insertOne(input);
  }

  find(id: Todo['id']): Promise<Todo | undefined> {
    return this.todos.findById(id).then(definedOrNotFound('To-Do not found'));
  }

  update(id: Todo['id'], input: UpdateTodo): Promise<Todo | undefined> {
    return this.todos
      .updateById(id, input)
      .then(definedOrNotFound('To-Do not found'));
  }

  delete(id: Todo['id']): Promise<number> {
    return this.todos.deleteById(id).then(updatedOrNotFound('To-Do not found'));
  }

  list(query: ListTodosQuery): Promise<Paginated<Todo>> {
    return this.todos.list(query);
  }
}
