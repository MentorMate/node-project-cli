import { Knex } from 'knex';
import { InsertUser, UpdateUser, User } from '@api/users/entities';
import { InsertTodo, UpdateTodo, Todo } from '@api/todos/entities';

// This is how knex adds TypeScript support.
// For more information see the docs https://knexjs.org/guide/#typescript.
declare module 'knex/types/tables' {
  interface Tables {
    users: Knex.CompositeTableType<User, InsertUser, UpdateUser>;
    todos: Knex.CompositeTableType<Todo, InsertTodo, UpdateTodo>;
  }
}
