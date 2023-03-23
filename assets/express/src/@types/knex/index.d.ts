import { Knex } from 'knex';
import {
  Todo,
  InsertTodo,
  UpdateTodo,
  User,
  InsertUser,
  UpdateUser,
} from '@modules/database';

declare module 'knex/types/tables' {
  interface Tables {
    todos: Knex.CompositeTableType<Todo, InsertTodo, UpdateTodo>;
    users: Knex.CompositeTableType<User, InsertUser, UpdateUser>;
  }
}
