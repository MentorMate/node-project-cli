import { ListTodosQuery } from '@common/data/models';
import { Paginated } from '@common/query';
import { Todo, InsertTodo, UpdateTodo } from '@modules/database';

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
