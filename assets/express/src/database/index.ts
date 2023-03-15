import { DbCollection } from './interfaces';
import { initializeKnex } from './initilize-knex';
import {
  initializeTodoRepository,
  initializeUserRepository,
} from './repositories';

export * from './interfaces';
export * from './repositories';
export * from './utils';
export * from './knex-extensions'

export default function (
  knex: ReturnType<typeof initializeKnex>
): DbCollection {
  return {
    todoRepository: initializeTodoRepository(knex),
    userRepository: initializeUserRepository(knex),
  };
}
