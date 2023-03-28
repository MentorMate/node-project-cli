import { Paginated } from '@common/query';
import {
  Todo,
  InsertTodo,
  UpdateTodo,
  ListTodosQuery,
} from '@modules/database';

export interface TodosServiceInterface {
  create: (input: InsertTodo) => Promise<Todo>;
  find: (id: Todo['id'], userId: Todo['userId']) => Promise<Todo | undefined>;
  update: (
    id: Todo['id'],
    userId: Todo['userId'],
    input: UpdateTodo
  ) => Promise<Todo | undefined>;
  delete: (id: Todo['id'], userId: Todo['userId']) => Promise<number>;
  list: (
    userId: Todo['userId'],
    query: ListTodosQuery
  ) => Promise<Paginated<Todo>>;
}
