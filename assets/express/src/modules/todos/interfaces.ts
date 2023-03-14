import { ListTodosQuery, Paginated } from '@database';
import { Todo, CreateTodoInput, UpdateTodoInput } from '..';

export interface TodoService {
  create: (payload: CreateTodoInput) => Promise<Todo | undefined>;
  list: (query: ListTodosQuery) => Promise<Paginated<Todo> | undefined>;
  find: (id: number) => Promise<Todo | undefined>;
  update: (id: number, payload: UpdateTodoInput) => Promise<Todo | undefined>;
  delete: (id: number) => Promise<number>;
}
