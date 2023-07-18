import { Paginated } from '@utils/query';
import { InsertTodo, ListTodosQuery, Todo, UpdateTodo } from '../entities';

export interface TodosRepositoryInterface {
  insertOne: (input: InsertTodo) => Promise<Todo>;
  findById: (
    id: Todo['id'],
    userId: Todo['userId']
  ) => Promise<Todo | undefined>;
  updateById: (
    id: Todo['id'],
    userId: Todo['userId'],
    input: UpdateTodo
  ) => Promise<Todo | undefined>;
  deleteById: (id: Todo['id'], userId: Todo['userId']) => Promise<number>;
  list: (
    userId: Todo['userId'],
    query: ListTodosQuery
  ) => Promise<Paginated<Todo>>;
}
