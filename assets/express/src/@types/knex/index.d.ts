import { Knex } from 'knex';

import { Todo, InsertTodo, UpdateTodo } from '../../index';

declare module 'knex/types/tables' {
  interface Tables {
    todos: Knex.CompositeTableType<Todo, InsertTodo, UpdateTodo>;
  }
}
