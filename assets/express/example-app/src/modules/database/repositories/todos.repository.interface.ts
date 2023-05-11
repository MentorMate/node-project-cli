import { ListTodosQuery } from '@common/data/models';
import { InsertTodo, Todo, UpdateTodo } from '../models';
import { Paginated } from '@common/query';

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
