import { InsertTodo, Todo, UpdateTodo } from '../models';
import { ListTodosQuery } from '../queries';
import { Paginated } from '../utils';

export type TodosRepositoryInterface = {
  insertOne: (input: InsertTodo) => Promise<Todo>;
  findById: (id: Todo['id']) => Promise<Todo | undefined>;
  updateById: (id: Todo['id'], input: UpdateTodo) => Promise<Todo | undefined>;
  deleteById: (id: Todo['id']) => Promise<number>;
  list: (query: ListTodosQuery) => Promise<Paginated<Todo>>;
};
