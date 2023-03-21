import {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  User,
  CreateUserInput,
  UpdateUserInput,
} from '@modules';
import { ListTodosQuery, ListUsersQuery } from '../repositories';
import { Paginated } from '../utils';

export type TodoRepository = {
  create: (input: CreateTodoInput) => Promise<Todo>;
  update: (id: number, input: UpdateTodoInput) => Promise<Todo | undefined>;
  delete: (id: number) => Promise<number>;
  find: (id: number) => Promise<Todo | undefined>;
  list: (query: ListTodosQuery) => Promise<Paginated<Todo>>;
};

export type UserRepository = {
  create: (input: CreateUserInput) => Promise<User>;
  update: (email: string, input: UpdateUserInput) => Promise<User | undefined>;
  delete: (email: string) => Promise<number>;
  find: (email: string) => Promise<User | undefined>;
  list: (query: ListUsersQuery) => Promise<Paginated<User>>;
};
