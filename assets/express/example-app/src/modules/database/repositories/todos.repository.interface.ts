import { InsertTodo, Todo, UpdateTodo } from '../models';
import { ListTodosQuery } from '../queries';
import { Paginated } from '@common/query';

export type TodosRepositoryInterface = {
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
};
