import { Inject, Service } from 'typedi';
import { Paginated } from '@common/query';
import {
  definedOrNotFound,
  TodosRepository,
  updatedOrNotFound,
} from '@modules/database';
import {
  InsertTodo,
  ListTodosQuery,
  Todo,
  TodosRepositoryInterface,
  UpdateTodo,
} from '@modules/database';
import { TodosServiceInterface } from './todos.service.interface';

@Service()
export class TodosService implements TodosServiceInterface {
  constructor(
    @Inject(() => TodosRepository)
    private readonly todos: TodosRepositoryInterface
  ) {}

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
