import { Paginated } from '@utils/query';
import { InsertTodo, ListTodosQuery, Todo, UpdateTodo } from '../entities';

export interface TodosServiceInterface {
  create: (input: InsertTodo) => Promise<Todo>;
  find: (id: Todo['id'], userId: Todo['userId']) => Promise<Todo>;
  update: (
    id: Todo['id'],
    userId: Todo['userId'],
    input: UpdateTodo
  ) => Promise<Todo>;
  delete: (id: Todo['id'], userId: Todo['userId']) => Promise<number>;
  list: (
    userId: Todo['userId'],
    query: ListTodosQuery
  ) => Promise<Paginated<Todo>>;
}
