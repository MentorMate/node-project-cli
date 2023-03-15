/* eslint-disable @typescript-eslint/no-namespace */
import { Knex } from 'knex';
import {
  CreateTodoInput,
  UpdateTodoInput,
  Todo,
  User,
  CreateUserInput,
  UpdateUserInput,
} from '@modules';

declare module 'knex/types/tables' {
  interface Tables {
    todos: Knex.CompositeTableType<Todo, CreateTodoInput, UpdateTodoInput>;
    users: Knex.CompositeTableType<User, CreateUserInput, UpdateUserInput>;
  }
}
