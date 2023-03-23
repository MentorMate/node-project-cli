import { Paginated } from '@common/query';
import {
  Todo,
  InsertTodo,
  UpdateTodo,
  ListTodosQuery,
} from '@modules/database';

export interface TodosServiceInterface {
  create: (input: InsertTodo) => Promise<Todo>;
  find: (id: Todo['id']) => Promise<Todo | undefined>;
  update: (id: Todo['id'], payload: UpdateTodo) => Promise<Todo | undefined>;
  delete: (id: Todo['id']) => Promise<number>;
  list: (query: ListTodosQuery) => Promise<Paginated<Todo>>;
}
